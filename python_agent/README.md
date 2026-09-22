# ZeeNexus Autonomous Python Agent

Created by **Rana Zeeshan** (`ZeeNexus`)

A lightweight, modular Python Agent demonstrating an autonomous **ReAct (Reasoning + Action)** tool-calling loop using the OpenAI API.

## Features
- **ReAct Loop Execution**: Iteratively reasons, selects tools, observes tool results, and synthesizes answers.
- **Custom Function Tools**:
  - `query_portfolio`: Dynamic lookup of Rana Zeeshan's engineering skills, experience, and projects.
  - `calculate_math`: Safe evaluation of numeric mathematical expressions.
  - `get_system_time`: Real-time timestamp synchronization.
- **Dual Mode**:
  - **Live OpenAI Mode**: Activates when `OPENAI_API_KEY` is present.
  - **Simulated Offline Mode**: Enables testing and demonstrations even without active API keys.

## Quickstart

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Run automated test suite:
   ```bash
   python agent.py --test
   ```

3. Run interactive CLI:
   ```bash
   python agent.py
   ```

4. Or pass a one-off prompt:
   ```bash
   python agent.py --prompt "What are Rana Zeeshan's primary Agentic AI skills?"
   ```
