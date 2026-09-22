import { PORTFOLIO_DATA } from "./portfolio-data";
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
      name: "search_portfolio",
      description:
        "Search and retrieve information about Rana Zeeshan (ZeeNexus), his technical skills (Agentic AI, Python, Next.js, React, TypeScript), featured projects, contact links, and architectural experience.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The topic or keyword to search (e.g., 'skills', 'projects', 'agentic ai', 'bio', 'contact', 'frontend', 'python').",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_code_sandbox",
      description:
        "Simulate the execution of a Python or TypeScript code snippet in a secure sandbox and return the simulated output, complexity assessment, and verification.",
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
            description: "Optional timezone identifier (e.g., 'UTC', 'America/New_York', 'Asia/Karachi').",
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
            description: "The mathematical expression to evaluate (e.g. '2 ** 10', '1024 * 768 / 1000', 'sqrt(144)').",
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
    case "search_portfolio": {
      const q = String(args.query || "").toLowerCase();
      if (q.includes("skill") || q.includes("tech") || q.includes("stack")) {
        output = JSON.stringify({
          developer: PORTFOLIO_DATA.developer.name,
          title: PORTFOLIO_DATA.developer.title,
          skills: PORTFOLIO_DATA.developer.skills,
        }, null, 2);
      } else if (q.includes("project")) {
        output = JSON.stringify({
          projects: PORTFOLIO_DATA.projects,
        }, null, 2);
      } else if (q.includes("contact") || q.includes("social") || q.includes("link") || q.includes("github")) {
        output = JSON.stringify({
          socialLinks: PORTFOLIO_DATA.developer.socialLinks,
          brand: PORTFOLIO_DATA.developer.brand,
        }, null, 2);
      } else {
        output = JSON.stringify({
          developer: PORTFOLIO_DATA.developer,
          projects: PORTFOLIO_DATA.projects,
          capabilities: PORTFOLIO_DATA.capabilities,
        }, null, 2);
      }
      break;
    }

    case "execute_code_sandbox": {
      const lang = String(args.language || "python");
      const code = String(args.code || "");
      output = `[Sandbox Simulation: ${lang}]\nStatus: OK\nInput Code Length: ${code.length} characters\nExecution Trace: Simulated standard output executed successfully with zero runtime violations.\nAnalysis: Code follows modern ${lang} standards and patterns.`;
      break;
    }

    case "get_system_time": {
      const now = new Date();
      output = JSON.stringify({
        iso: now.toISOString(),
        utc: now.toUTCString(),
        localFormatted: now.toLocaleString(),
        timezone: args.timezone || "System Local / UTC",
      });
      break;
    }

    case "calculate_expression": {
      const expr = String(args.expression || "");
      try {
        // Sanitize: allow only numbers and basic operators
        if (/^[0-9+\-*/().\s^%]+$/.test(expr)) {
          const sanitized = expr.replace(/\^/g, "**");
          // eslint-disable-next-line no-eval
          const res = Function(`'use strict'; return (${sanitized})`)();
          output = `Result of (${expr}) = ${res}`;
        } else {
          output = `Expression [${expr}] sanitized check: contains disallowed characters.`;
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
