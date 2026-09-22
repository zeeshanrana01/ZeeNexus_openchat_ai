import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
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
  apiKey?: string;
  model?: string;
}

// Fallback response when no OpenAI API key is supplied
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
      `def solve_task(data: list) -> dict:\n` +
      `    """\n` +
      `    Processes input data and returns structured metrics.\n` +
      `    """\n` +
      `    if not data:\n` +
      `        return {"status": "empty", "total": 0}\n` +
      `    \n` +
      `    total = sum(data)\n` +
      `    average = total / len(data)\n` +
      `    return {\n` +
      `        "status": "success",\n` +
      `        "count": len(data),\n` +
      `        "total": total,\n` +
      `        "average": average\n` +
      `    }\n\n` +
      `# Example usage:\n` +
      `sample = [10, 25, 45, 80, 100]\n` +
      `print(solve_task(sample))\n` +
      `\`\`\`\n\n` +
      `### Key Points:\n` +
      `- **Type Annotations**: Explicit type hints improve code maintainability.\n` +
      `- **Defensive Handling**: Checks for empty inputs to avoid division by zero.\n` +
      `- **Performance**: Linear $O(n)$ complexity.\n\n` +
      `> 💡 *Note: To stream live answers directly from OpenAI GPT-4o, add your \`OPENAI_API_KEY\` in \`.env.local\` or click the Key icon in the top header.*`;
  } else if (q.includes("calculate") || q.includes("+") || q.includes("*") || q.includes("^") || q.includes("/")) {
    toolName = "calculate_expression";
    toolArgs = JSON.stringify({ expression: "2 ** 16" });
    toolResult = `Result = 65536`;
    responseText = `The calculated result is:\n\n\`\`\`text\n${toolResult}\n\`\`\`\n\nIs there anything else you would like to compute or analyze?`;
  } else if (q.includes("time") || q.includes("date")) {
    toolName = "get_system_time";
    toolArgs = JSON.stringify({ timezone: "Local" });
    const now = new Date();
    toolResult = JSON.stringify({ time: now.toLocaleString(), iso: now.toISOString() });
    responseText = `The current system time is **${now.toLocaleString()}** (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`;
  } else {
    responseText = `Hello! I'm **${persona.name}**, your AI assistant.\n\n` +
      `I can help you with:\n` +
      `- 💻 **Writing & Debugging Code** (Python, TypeScript, React, Next.js, and more)\n` +
      `- 🧠 **Explaining Complex Concepts** & problem solving\n` +
      `- ✍️ **Drafting Documents**, emails, and articles\n` +
      `- ⚡ **Executing Tools & Calculations**\n\n` +
      `How can I assist you today?\n\n` +
      `> 🔑 *To connect to live OpenAI GPT-4o / GPT-4o-mini models, click the **Key Settings** button at the top right or set \`OPENAI_API_KEY\` in \`.env.local\`.*`;
  }

  return { toolName, toolArgs, toolResult, responseText };
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, personaId = "default_assistant", apiKey: clientApiKey, model = "gpt-4o-mini" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const activeApiKey = clientApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
    const persona = CHAT_MODES[personaId] || CHAT_MODES.default_assistant;
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const encoder = new TextEncoder();

    // 1. Fallback when no API Key is provided
    if (!activeApiKey) {
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

            await new Promise((r) => setTimeout(r, 300));

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

    // 2. Live OpenAI API Streaming
    const openai = new OpenAI({ apiKey: activeApiKey });

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
          const response = await openai.chat.completions.create({
            model: model || "gpt-4o-mini",
            messages: formattedMessages,
            tools: AGENT_TOOLS,
            tool_choice: "auto",
            stream: true,
          });

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
              model: model || "gpt-4o-mini",
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
          const errMsg = error instanceof Error ? error.message : "OpenAI API streaming error";
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
