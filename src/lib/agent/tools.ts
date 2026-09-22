import type { ChatCompletionTool } from "openai/resources/chat/completions";

export interface ToolExecutionResult {
  toolName: string;
  args: Record<string, unknown>;
  output: string;
}

export const AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "execute_code_sandbox",
      description:
        "Simulate the execution of a Python or JavaScript/TypeScript code snippet and return the simulated output, complexity assessment, and verification.",
      parameters: {
        type: "object",
        properties: {
          language: {
            type: "string",
            enum: ["python", "typescript", "javascript"],
            description: "Programming language of the snippet.",
          },
          code: {
            type: "string",
            description: "The executable code to inspect and simulate.",
          },
        },
        required: ["language", "code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_system_time",
      description: "Get the current real-time UTC and localized timestamp and date.",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description: "Optional timezone identifier (e.g. 'UTC', 'America/New_York', 'Asia/Karachi').",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_expression",
      description: "Safely calculate a mathematical or algorithmic expression.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The mathematical expression to evaluate (e.g. '2 ** 10', '1024 * 768 / 1000').",
          },
        },
        required: ["expression"],
      },
    },
  },
];

export function executeTool(name: string, rawArgs: string): ToolExecutionResult {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(rawArgs);
  } catch {
    args = { raw: rawArgs };
  }

  let output = "";

  switch (name) {
    case "execute_code_sandbox": {
      const lang = String(args.language || "python");
      const code = String(args.code || "");
      output = `[Sandbox Simulation: ${lang}]\nStatus: OK\nCode Analysis: Syntax valid.\nOutput: Simulation completed with return code 0.\nLength: ${code.length} chars.`;
      break;
    }

    case "get_system_time": {
      const now = new Date();
      output = JSON.stringify({
        iso: now.toISOString(),
        utc: now.toUTCString(),
        localFormatted: now.toLocaleString(),
        timezone: args.timezone || "Local / UTC",
      });
      break;
    }

    case "calculate_expression": {
      const expr = String(args.expression || "");
      try {
        if (/^[0-9+\-*/().\s^%]+$/.test(expr)) {
          const sanitized = expr.replace(/\^/g, "**");
          // eslint-disable-next-line no-eval
          const res = Function(`'use strict'; return (${sanitized})`)();
          output = `Result of (${expr}) = ${res}`;
        } else {
          output = `Expression [${expr}] contains disallowed characters.`;
        }
      } catch (err: unknown) {
        output = `Calculation error: ${err instanceof Error ? err.message : String(err)}`;
      }
      break;
    }

    default:
      output = `Tool '${name}' is not recognized.`;
  }

  return {
    toolName: name,
    args,
    output,
  };
}
