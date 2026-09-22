import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AGENT_TOOLS, executeTool } from "@/lib/agent/tools";
import { AGENT_PERSONAS, AgentPersonaId } from "@/lib/agent/prompts";
import { PORTFOLIO_DATA } from "@/lib/agent/portfolio-data";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  personaId?: AgentPersonaId;
  apiKey?: string;
  model?: string;
}

// Fallback intelligent simulation when no OpenAI API key is supplied
function generateSimulationResponse(userPrompt: string, personaId: AgentPersonaId) {
  const q = userPrompt.toLowerCase();
  const persona = AGENT_PERSONAS[personaId] || AGENT_PERSONAS.zeenexus_core;

  let toolName = "";
  let toolArgs = "{}";
  let toolResult = "";
  let responseText = "";

  if (q.includes("skill") || q.includes("stack") || q.includes("python") || q.includes("next") || q.includes("react") || q.includes("agent")) {
    toolName = "search_portfolio";
    toolArgs = JSON.stringify({ query: "skills" });
    toolResult = JSON.stringify({
      developer: PORTFOLIO_DATA.developer.name,
      skills: PORTFOLIO_DATA.developer.skills,
    }, null, 2);

    responseText = `### 🚀 Rana Zeeshan's Technical Strengths & Skills\n\n` +
      `As **ZeeNexus Core Agent**, I queried Rana Zeeshan's technical portfolio data:\n\n` +
      `* **Agentic AI & LLMs**: ReAct Autonomous Architectures, OpenAI Tool Calling (GPT-4o/GPT-4o-mini), Multi-Agent Systems, LangChain/LlamaIndex paradigms.\n` +
      `* **Modern Frontend**: Next.js 14/15 (App Router), React.js, TypeScript, Tailwind CSS, Responsive Glassmorphic UI/UX.\n` +
      `* **Backend & Systems**: Python (AI Pipelines & Automation), Node.js Serverless APIs, SSE Streaming, Vercel & GitHub Actions.\n\n` +
      `> **Interactive Demo Mode**: This response was generated via local simulation. To enable live GPT-4o streaming, add your \`OPENAI_API_KEY\` in \`.env.local\` or click the **Key Settings** button above!`;
  } else if (q.includes("project") || q.includes("work") || q.includes("portfolio")) {
    toolName = "search_portfolio";
    toolArgs = JSON.stringify({ query: "projects" });
    toolResult = JSON.stringify({ projects: PORTFOLIO_DATA.projects }, null, 2);

    responseText = `### 📂 Featured Projects by Rana Zeeshan\n\n` +
      `Here are the flagship projects identified in the portfolio database:\n\n` +
      `1. **ZeeNexus OpenChat AI**\n` +
      `   * **Tech**: Next.js, React, TypeScript, Tailwind CSS, OpenAI API, Python\n` +
      `   * **Features**: Autonomous tool-calling, ReAct reasoning visualization, SSE streaming, Vercel & GitHub deployment ready.\n\n` +
      `2. **Autonomous Python Agent Framework**\n` +
      `   * **Tech**: Python 3, OpenAI SDK, AsyncIO, JSON Schema\n` +
      `   * **Features**: Modular ReAct agent execution loop with automated function execution.\n\n` +
      `3. **Next.js AI Enterprise Dashboard**\n` +
      `   * **Tech**: Next.js, TypeScript, Tailwind CSS, Lucide React\n` +
      `   * **Features**: Real-time agent monitoring and token telemetry.\n\n` +
      `Feel free to ask for architectural deep-dives on any of these systems!`;
  } else if (q.includes("time") || q.includes("date")) {
    toolName = "get_system_time";
    toolArgs = JSON.stringify({ timezone: "Local" });
    const now = new Date();
    toolResult = JSON.stringify({ time: now.toLocaleString(), iso: now.toISOString() });
    responseText = `The current system time retrieved by the agent is: **${now.toLocaleString()}**.\n\nAll agent operations and timestamps are synchronized.`;
  } else if (q.includes("calculate") || q.includes("+") || q.includes("*") || q.includes("^")) {
    toolName = "calculate_expression";
    toolArgs = JSON.stringify({ expression: "2 ** 16" });
    toolResult = `Result = 65536`;
    responseText = `The calculation was executed using the agentic arithmetic tool:\n\n\`\`\`text\n${toolResult}\n\`\`\`\n\nMathematical and logic expressions are safely evaluated within the agent execution loop.`;
  } else {
    responseText = `Greetings! I am **${persona.name}** (${persona.tagline}).\n\n` +
      `I am equipped with autonomous agent capabilities, including:\n` +
      `- **Tool Calling**: Querying Rana Zeeshan's portfolio, executing simulated code, and fetching system telemetry.\n` +
      `- **ReAct Reasoning**: Transparent step-by-step thinking before delivering results.\n` +
      `- **Multi-Persona Specialization**: Switch between Code Architect, Portfolio Ambassador, and Researcher modes.\n\n` +
      `> **Tip**: Configure your \`OPENAI_API_KEY\` in \`.env.local\` or click **Key Settings** in the header to unlock live OpenAI completions. What would you like to explore?`;
  }

  return { toolName, toolArgs, toolResult, responseText };
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, personaId = "zeenexus_core", apiKey: clientApiKey, model = "gpt-4o-mini" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const activeApiKey = clientApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
    const persona = AGENT_PERSONAS[personaId] || AGENT_PERSONAS.zeenexus_core;
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const encoder = new TextEncoder();

    // 1. IF NO API KEY IS CONFIGURED: Return an intelligent simulated streaming SSE response
    if (!activeApiKey) {
      const sim = generateSimulationResponse(latestUserMessage, personaId);

      const stream = new ReadableStream({
        async start(controller) {
          // Emit initial thinking/reasoning state
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "reasoning",
                thought: `[Persona: ${persona.name}] Evaluating prompt: "${latestUserMessage.slice(0, 60)}..."`,
              })}\n\n`
            )
          );

          await new Promise((r) => setTimeout(r, 400));

          // If a tool was triggered in simulation
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

            await new Promise((r) => setTimeout(r, 600));

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "tool_call_result",
                  toolName: sim.toolName,
                  output: sim.toolResult,
                })}\n\n`
              )
            );

            await new Promise((r) => setTimeout(r, 300));
          }

          // Stream chunks of text
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

    // 2. LIVE OPENAI API KEY CONFIGURED: Real Agentic ReAct Streaming with OpenAI SDK
    const openai = new OpenAI({ apiKey: activeApiKey });

    const formattedMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${persona.systemPrompt}\n\nCurrent Date & Local Context: ${new Date().toISOString()}`,
      },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
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
                thought: `Connecting to OpenAI (${model}). Activating ${persona.name}...`,
              })}\n\n`
            )
          );

          // Step 1: Initial call with tools
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

            // Direct text content
            if (delta?.content) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "content", text: delta.content })}\n\n`
                )
              );
            }

            // Accumulate tool calls
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

          // If tool calls were made, execute them and perform second-pass completion
          if (toolCallsAcc.length > 0) {
            const toolMessages: ChatCompletionMessageParam[] = [];

            // Add assistant tool_calls message
            toolMessages.push({
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
            });

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

            // Second pass: Send tool results back to synthesize final response
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
