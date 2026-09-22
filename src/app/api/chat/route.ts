import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Ollama } from "ollama";
import { AGENT_TOOLS, executeTool } from "@/lib/agent/tools";
import { CHAT_MODES, ModelPersonaId } from "@/lib/agent/prompts";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  personaId?: ModelPersonaId;
  provider?: "openai" | "ollama" | "groq" | "openrouter";
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

// Fallback response when no active provider or key is available
function generateSimulationResponse(userPrompt: string, personaId: ModelPersonaId) {
  const q = userPrompt.toLowerCase();
  const persona = CHAT_MODES[personaId] || CHAT_MODES.default_assistant;

  let toolName = "";
  let toolArgs = "{}";
  let toolResult = "";
  let responseText = "";

  if (q.includes("python") || q.includes("code") || q.includes("script") || q.includes("function") || q.includes("javascript") || q.includes("typescript")) {
    toolName = "execute_code_sandbox";
    toolArgs = JSON.stringify({ language: "python", code: "print('Hello from OpenChat AI!')" });
    toolResult = `[Sandbox Simulation: python]\nStatus: OK\nOutput: Code parsed and validated.`;

    responseText = `Here is a clean implementation based on your request:\n\n` +
      `\`\`\`python\n` +
      `def process_data(items: list) -> dict:\n` +
      `    """\n` +
      `    Processes items and computes aggregate statistics.\n` +
      `    """\n` +
      `    if not items:\n` +
      `        return {"count": 0, "total": 0}\n` +
      `    \n` +
      `    return {\n` +
      `        "count": len(items),\n` +
      `        "total": sum(items),\n` +
      `        "average": sum(items) / len(items)\n` +
      `    }\n\n` +
      `print(process_data([10, 20, 30, 40]))\n` +
      `\`\`\`\n\n` +
      `> 💡 *Ready to run real models? Choose **Ollama (Local Free)** or **OpenAI** in Key Settings above!*`;
  } else if (q.includes("calculate") || q.includes("+") || q.includes("*") || q.includes("^") || q.includes("/")) {
    toolName = "calculate_expression";
    toolArgs = JSON.stringify({ expression: "2 ** 16" });
    toolResult = `Result = 65536`;
    responseText = `The calculated result is:\n\n\`\`\`text\n${toolResult}\n\`\`\``;
  } else {
    responseText = `Hello! I'm **${persona.name}**.\n\n` +
      `You can connect this app directly to:\n` +
      `1. 🦙 **Ollama SDK (100% Free Local)**: Run \`ollama run llama3.2\` on your machine, then choose Ollama in Key Settings.\n` +
      `2. ⚡ **OpenAI SDK**: Use your OpenAI key for GPT-4o.\n` +
      `3. 🌐 **Groq / OpenRouter**: Ultra-fast free cloud keys.\n\n` +
      `Click the **Key Settings** button at the top right to get started!`;
  }

  return { toolName, toolArgs, toolResult, responseText };
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const {
      messages,
      personaId = "default_assistant",
      provider = "openai",
      apiKey: clientApiKey,
      baseURL: clientBaseUrl,
      model: clientModel,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const isOllamaSelected =
      provider === "ollama" ||
      clientBaseUrl?.includes("11434") ||
      Boolean(process.env.OLLAMA_HOST);

    const activeBaseUrl = clientBaseUrl?.trim() || (isOllamaSelected ? "http://127.0.0.1:11434" : undefined);
    const activeApiKey = clientApiKey?.trim() || process.env.OPENAI_API_KEY?.trim() || "";
    const activeModel = clientModel?.trim() || (isOllamaSelected ? "llama3.2" : "gpt-4o-mini");
    const persona = CHAT_MODES[personaId] || CHAT_MODES.default_assistant;
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const encoder = new TextEncoder();

    // 1. If using the Official OLLAMA SDK (Local, free, open-source)
    if (isOllamaSelected) {
      const ollamaHost = activeBaseUrl?.replace(/\/v1\/?$/, "") || "http://127.0.0.1:11434";
      const ollamaClient = new Ollama({ host: ollamaHost });

      const ollamaMessages = [
        { role: "system", content: persona.systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const stream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "reasoning",
                  thought: `Connecting to local Ollama SDK at ${ollamaHost} (Model: ${activeModel})...`,
                })}\n\n`
              )
            );

            // Stream response using official Ollama chat SDK
            const response = await ollamaClient.chat({
              model: activeModel,
              messages: ollamaMessages,
              stream: true,
            });

            for await (const part of response) {
              if (part.message?.content) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "content",
                      text: part.message.content,
                    })}\n\n`
                  )
                );
              }
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done", provider: "ollama" })}\n\n`)
            );
            controller.close();
          } catch (ollamaError: unknown) {
            const err = ollamaError instanceof Error ? ollamaError.message : "Ollama connection error";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: `[Ollama SDK] ${err}. Make sure Ollama is running ('ollama serve' or 'ollama run ${activeModel}') on ${ollamaHost}.`,
                })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // 2. If NO OpenAI key or BaseURL is provided -> Simulation Fallback
    if (!activeApiKey && !activeBaseUrl) {
      const sim = generateSimulationResponse(latestUserMessage, personaId);

      const stream = new ReadableStream({
        async start(controller) {
          if (sim.toolName) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "tool_call_start",
                  toolName: sim.toolName,
                  args: sim.toolArgs,
                })}\n\n`
              )
            );
            await new Promise((r) => setTimeout(r, 250));

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "tool_call_result",
                  toolName: sim.toolName,
                  output: sim.toolResult,
                })}\n\n`
              )
            );
            await new Promise((r) => setTimeout(r, 200));
          }

          const words = sim.responseText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "content", text: chunk })}\n\n`)
            );
            await new Promise((r) => setTimeout(r, 20));
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", isSimulation: true })}\n\n`)
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // 3. Official OPENAI SDK (OpenAI, Groq, OpenRouter)
    const openai = new OpenAI({
      apiKey: activeApiKey || "dummy-key",
      baseURL: activeBaseUrl,
    });

    const formattedMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${persona.systemPrompt}\n\nCurrent Timestamp: ${new Date().toISOString()}`,
      },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let response;
          try {
            response = await openai.chat.completions.create({
              model: activeModel,
              messages: formattedMessages,
              tools: AGENT_TOOLS,
              tool_choice: "auto",
              stream: true,
            });
          } catch {
            response = await openai.chat.completions.create({
              model: activeModel,
              messages: formattedMessages,
              stream: true,
            });
          }

          let toolCallsAcc: Array<{
            id: string;
            name: string;
            arguments: string;
          }> = [];

          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "content", text: delta.content })}\n\n`
                )
              );
            }

            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const index = tc.index ?? 0;
                if (!toolCallsAcc[index]) {
                  toolCallsAcc[index] = {
                    id: tc.id || `call_${Date.now()}_${index}`,
                    name: tc.function?.name || "",
                    arguments: tc.function?.arguments || "",
                  };
                } else {
                  if (tc.function?.name) {
                    toolCallsAcc[index].name += tc.function.name;
                  }
                  if (tc.function?.arguments) {
                    toolCallsAcc[index].arguments += tc.function.arguments;
                  }
                }
              }
            }
          }

          if (toolCallsAcc.length > 0) {
            const toolMessages: ChatCompletionMessageParam[] = [
              {
                role: "assistant",
                content: null,
                tool_calls: toolCallsAcc.map((tc) => ({
                  id: tc.id,
                  type: "function" as const,
                  function: {
                    name: tc.name,
                    arguments: tc.arguments,
                  },
                })),
              },
            ];

            for (const tc of toolCallsAcc) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "tool_call_start",
                    toolName: tc.name,
                    args: tc.arguments,
                  })}\n\n`
                )
              );

              const toolResult = executeTool(tc.name, tc.arguments);

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "tool_call_result",
                    toolName: tc.name,
                    output: toolResult.output,
                  })}\n\n`
                )
              );

              toolMessages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: toolResult.output,
              });
            }

            const secondPassStream = await openai.chat.completions.create({
              model: activeModel,
              messages: [...formattedMessages, ...toolMessages],
              stream: true,
            });

            for await (const chunk of secondPassStream) {
              const deltaText = chunk.choices[0]?.delta?.content;
              if (deltaText) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "content", text: deltaText })}\n\n`
                  )
                );
              }
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", isSimulation: false })}\n\n`)
          );
          controller.close();
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : "Streaming error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: errMsg,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
