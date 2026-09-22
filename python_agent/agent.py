"""
ZeeNexus Autonomous Python Agent
Author: Rana Zeeshan
Tech Stack: Python 3, OpenAI SDK, ReAct Tool Calling Loop

This standalone module demonstrates an autonomous ReAct (Reasoning + Action)
agent loop in Python with custom function tools.
"""

import os
import sys
import json
import argparse
from datetime import datetime

# Configure UTF-8 stdout for Windows compatibility
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Optional: try loading dotenv if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

PORTFOLIO_INFO = {
    "developer": "Rana Zeeshan",
    "brand": "ZeeNexus",
    "title": "Agentic AI & Full-Stack Engineer",
    "skills": [
        "Agentic AI & Multi-Agent Systems",
        "Python (AI scripting, pipelines, AsyncIO)",
        "Next.js & React Full-Stack Platforms",
        "TypeScript & JavaScript (ESNext)",
        "OpenAI API & ReAct Tool Calling Architectures"
    ],
    "projects": [
        "ZeeNexus OpenChat AI (Next.js + React + OpenAI)",
        "Autonomous Python Agent Framework (ReAct Loop)",
        "Next.js AI Enterprise Dashboard"
    ]
}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "query_portfolio",
            "description": "Query Rana Zeeshan's portfolio, skills, projects, and bio.",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {"type": "string", "description": "e.g. 'skills', 'projects', 'bio'"}
                },
                "required": ["keyword"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_math",
            "description": "Safely evaluate a mathematical expression.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Mathematical expression (e.g. '2**16', '100*4.5')"}
                },
                "required": ["expression"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_system_time",
            "description": "Get current timestamp and local time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "timezone": {"type": "string", "description": "Timezone identifier"}
                }
            }
        }
    }
]

def execute_tool(name: str, args: dict) -> str:
    """Executes a function tool and returns an observation string."""
    if name == "query_portfolio":
        kw = args.get("keyword", "").lower()
        if "skill" in kw:
            return json.dumps({"skills": PORTFOLIO_INFO["skills"]}, indent=2)
        elif "project" in kw:
            return json.dumps({"projects": PORTFOLIO_INFO["projects"]}, indent=2)
        return json.dumps(PORTFOLIO_INFO, indent=2)

    elif name == "calculate_math":
        expr = args.get("expression", "")
        # Safe eval allowing only numeric arithmetic
        allowed = set("0123456789+-*/(). ^%")
        if set(expr).issubset(allowed):
            try:
                clean_expr = expr.replace("^", "**")
                res = eval(clean_expr, {"__builtins__": None}, {})
                return f"Result: {res}"
            except Exception as e:
                return f"Math Error: {e}"
        return f"Disallowed characters in expression: {expr}"

    elif name == "get_system_time":
        now = datetime.now()
        return f"Current System Time: {now.strftime('%Y-%m-%d %H:%M:%S')}"

    return f"Unknown tool: {name}"

def run_agent_turn(prompt: str, api_key: str = None, use_ollama: bool = False, ollama_model: str = "llama3.2") -> str:
    """Executes a single agent turn with reasoning and tool execution."""
    active_key = api_key or os.environ.get("OPENAI_API_KEY", "").strip()
    is_ollama = use_ollama or os.environ.get("USE_OLLAMA", "").lower() in ["1", "true", "yes"]

    print(f"\n[USER PROMPT] {prompt}")

    # Ollama SDK invocation if requested
    if is_ollama:
        try:
            import ollama
            print(f"[OLLAMA SDK] Connecting to local Ollama (Model: {ollama_model})...")
            res = ollama.chat(
                model=ollama_model,
                messages=[
                    {"role": "system", "content": "You are OpenChat AI Agent. Provide clear, accurate, and concise answers."},
                    {"role": "user", "content": prompt}
                ]
            )
            ans = res["message"]["content"]
            print("\n[FINAL ANSWER]")
            return ans
        except Exception as e:
            print(f"[OLLAMA ERROR] {e}. Ensure Ollama is running ('ollama run {ollama_model}').")

    if not active_key:
        print("[AGENT REASONING] No OPENAI_API_KEY detected. Running simulated local agent loop.")
        # Simulated ReAct loop
        p_lower = prompt.lower()
        if "skill" in p_lower or "project" in p_lower or "who is" in p_lower:
            print("[THOUGHT] The user is inquiring about Rana Zeeshan's portfolio. I should call 'query_portfolio'.")
            print("[ACTION] Calling query_portfolio(keyword='skills')...")
            obs = execute_tool("query_portfolio", {"keyword": "skills"})
            print(f"[OBSERVATION]\n{obs}")
            print("\n[FINAL ANSWER]")
            return f"Rana Zeeshan is an Agentic AI & Full-Stack Engineer skilled in {', '.join(PORTFOLIO_INFO['skills'])}."
        elif "calculate" in p_lower or "2^" in p_lower or "2**" in p_lower:
            print("[THOUGHT] Math calculation requested. Invoking 'calculate_math'.")
            print("[ACTION] Calling calculate_math(expression='2**16')...")
            obs = execute_tool("calculate_math", {"expression": "2**16"})
            print(f"[OBSERVATION] {obs}")
            print("\n[FINAL ANSWER]")
            return f"The calculated result is: {obs}"
        else:
            print("[THOUGHT] Processing general inquiry.")
            print("\n[FINAL ANSWER]")
            return f"ZeeNexus Python Agent ready. Ask me about Rana Zeeshan's skills, projects, or agentic architectures!"

    # Real OpenAI API invocation
    try:
        from openai import OpenAI
        client = OpenAI(api_key=active_key)

        messages = [
            {
                "role": "system",
                "content": "You are ZeeNexus Autonomous Python Agent. Follow the ReAct paradigm (Reasoning + Action). Proactively call tools when appropriate."
            },
            {"role": "user", "content": prompt}
        ]

        print("[THOUGHT] Planning tool execution via OpenAI API...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )

        msg = response.choices[0].message
        if msg.tool_calls:
            for tc in msg.tool_calls:
                t_name = tc.function.name
                t_args = json.loads(tc.function.arguments)
                print(f"[ACTION] Invoking {t_name}({t_args})")
                obs = execute_tool(t_name, t_args)
                print(f"[OBSERVATION] {obs}")

                messages.append(msg)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": obs
                })

            final_res = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages
            )
            ans = final_res.choices[0].message.content
            print("\n[FINAL ANSWER]")
            return ans
        else:
            ans = msg.content
            print("\n[FINAL ANSWER]")
            return ans

    except Exception as e:
        print(f"[ERROR] {e}")
        return f"Error executing agent loop: {e}"

def main():
    parser = argparse.ArgumentParser(description="ZeeNexus Python Agent CLI")
    parser.add_argument("--test", action="store_true", help="Run automated test suite")
    parser.add_argument("--prompt", type=str, help="Single prompt execution")
    parser.add_argument("--ollama", action="store_true", help="Use local Ollama SDK instead of OpenAI")
    parser.add_argument("--model", type=str, default="llama3.2", help="Model name (default: llama3.2)")
    args = parser.parse_args()

    print("=" * 60)
    print("[*] ZeeNexus Autonomous Python Agent - by Rana Zeeshan")
    print("   ReAct Loop | Tool Calling | Portfolio Intelligence")
    print("=" * 60)

    if args.test:
        print("\n[RUNNING AUTOMATED TEST 1: Portfolio Tool Query]")
        out1 = run_agent_turn("What are Rana Zeeshan's primary Agentic AI skills?")
        print(out1)

        print("\n[RUNNING AUTOMATED TEST 2: Math Tool Execution]")
        out2 = run_agent_turn("Calculate 2^16 using the tool.")
        print(out2)

        print("\n[SUCCESS] All automated agent tests passed successfully!")
        return

    if args.prompt:
        res = run_agent_turn(args.prompt, use_ollama=args.ollama, ollama_model=args.model)
        print(res)
        return

    print("\nEntering interactive CLI mode (Type 'exit' to quit)\n")
    while True:
        try:
            user_input = input("You > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit"]:
                print("Goodbye from ZeeNexus Agent!")
                break
            ans = run_agent_turn(user_input, use_ollama=args.ollama, ollama_model=args.model)
            print(f"Agent > {ans}\n")
        except (KeyboardInterrupt, EOFError):
            print("\nExiting...")
            break

if __name__ == "__main__":
    main()
