"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar, ChatSession } from "@/components/Sidebar";
import { ChatMessage, MessageItem } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { ReasoningStep } from "@/components/ReasoningCard";
import { AGENT_PERSONAS, AgentPersonaId } from "@/lib/agent/prompts";
import { Sparkles, Terminal, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState<AgentPersonaId>("zeenexus_core");
  const [model, setModel] = useState("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("session_default");

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("zeenexus_openai_key");
      if (savedKey) setApiKey(savedKey);

      const savedSessions = localStorage.getItem("zeenexus_chat_sessions");
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } else {
        const defaultSession: ChatSession = {
          id: "session_default",
          title: "Welcome to ZeeNexus",
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setSessions([defaultSession]);
      }

      const savedChat = localStorage.getItem("zeenexus_chat_history_session_default");
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      }
    } catch {
      // LocalStorage access error handling
    }
  }, []);

  // Auto-scroll on new messages or streaming chunks
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Persist current session messages
  const persistMessages = (sessionId: string, newMessages: MessageItem[]) => {
    try {
      localStorage.setItem(`zeenexus_chat_history_${sessionId}`, JSON.stringify(newMessages));
    } catch {
      // ignore
    }
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("zeenexus_openai_key", newKey);
  };

  const handleClearApiKey = () => {
    setApiKey("");
    localStorage.removeItem("zeenexus_openai_key");
  };

  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Conversation",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newId);
    setMessages([]);
    localStorage.setItem("zeenexus_chat_sessions", JSON.stringify(updated));
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const saved = localStorage.getItem(`zeenexus_chat_history_${sessionId}`);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem("zeenexus_chat_sessions", JSON.stringify(updated));
    localStorage.removeItem(`zeenexus_chat_history_${sessionId}`);

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleClearChat = () => {
    if (confirm("Reset current conversation?")) {
      setMessages([]);
      localStorage.removeItem(`zeenexus_chat_history_${activeSessionId}`);
    }
  };

  // Submit Prompt to Agent
  const handleSubmit = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || input).trim();
    if (!promptToSend || isStreaming) return;

    setInput("");

    // Create user message
    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: promptToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update session title if first message
    if (messages.length === 0) {
      const title = promptToSend.slice(0, 30) + (promptToSend.length > 30 ? "..." : "");
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, title } : s
      );
      setSessions(updatedSessions);
      localStorage.setItem("zeenexus_chat_sessions", JSON.stringify(updatedSessions));
    }

    // Prepare assistant placeholder message
    const currentPersona = AGENT_PERSONAS[currentPersonaId];
    const assistantMsgId = `ast_${Date.now()}`;
    const initialAssistantMsg: MessageItem = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      personaAvatar: currentPersona.avatar,
      personaName: currentPersona.name,
      reasoningSteps: [],
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMsg, initialAssistantMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          personaId: currentPersonaId,
          apiKey: apiKey.trim(),
          model: model,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with status ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream received.");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";
      const reasoningSteps: ReasoningStep[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === "reasoning") {
              reasoningSteps.push({ thought: data.thought });
            } else if (data.type === "tool_call_start") {
              reasoningSteps.push({
                toolName: data.toolName,
                args: data.args,
              });
            } else if (data.type === "tool_call_result") {
              const lastStep = reasoningSteps[reasoningSteps.length - 1];
              if (lastStep && lastStep.toolName === data.toolName) {
                lastStep.output = data.output;
              } else {
                reasoningSteps.push({
                  toolName: data.toolName,
                  output: data.output,
                });
              }
            } else if (data.type === "content") {
              accumulatedContent += data.text;
            } else if (data.type === "error") {
              accumulatedContent += `\n\n> ⚠️ **Error:** ${data.message}`;
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      content: accumulatedContent,
                      reasoningSteps: [...reasoningSteps],
                    }
                  : msg
              )
            );
          } catch {
            // parse error
          }
        }
      }

      // Finish streaming
      setMessages((prev) => {
        const finalMsgs = prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        );
        persistMessages(activeSessionId, finalMsgs);
        return finalMsgs;
      });
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        const errMsg = err instanceof Error ? err.message : "Failed to generate response.";
        setMessages((prev) => {
          const finalMsgs = prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `> ⚠️ **Agent Error:** ${errMsg}\n\nPlease verify your network connection or API key settings.`,
                  isStreaming: false,
                }
              : msg
          );
          persistMessages(activeSessionId, finalMsgs);
          return finalMsgs;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const currentPersona = AGENT_PERSONAS[currentPersonaId] || AGENT_PERSONAS.zeenexus_core;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onTriggerToolDemo={(query) => handleSubmit(query)}
      />

      {/* Main Chat Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Navigation Header */}
        <Header
          currentPersonaId={currentPersonaId}
          onSelectPersona={setCurrentPersonaId}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
          hasCustomKey={Boolean(apiKey)}
          onClearChat={handleClearChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Chat Feed */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              /* Welcome Hero / Starter Screen */
              <div className="py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Agentic AI • ReAct Architecture • Next.js Full-Stack</span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                    ZeeNexus <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">OpenChat AI</span>
                  </h1>

                  <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    Welcome to Rana Zeeshan’s flagship autonomous portfolio agent. Experience live tool-calling, multi-step chain-of-thought reasoning, and intelligent system architecture.
                  </p>
                </div>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1">Autonomous Tool-Calling</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Equipped with ReAct function tools to query portfolio data, test code algorithms, and compute metrics.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1">Multi-Persona Switcher</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Toggle seamlessly between Full-Stack Code Architect, Portfolio Ambassador, and Researcher personas.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                      <Shield className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1">Vercel & Local Ready</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Runs locally with instant simulated fallbacks, and deploys to Vercel with zero extra server configuration.
                    </p>
                  </div>
                </div>

                {/* Suggested Prompts Section */}
                <div className="space-y-3 pt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Try a starter question for the {currentPersona.name}:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentPersona.suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSubmit(prompt)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left text-xs text-slate-200 group transition-all"
                      >
                        <span className="line-clamp-2">{prompt}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}
            <div ref={chatBottomRef} />
          </div>
        </main>

        {/* Input Bar */}
        <footer className="border-t border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={() => handleSubmit()}
            onStop={handleStop}
            isStreaming={isStreaming}
            model={model}
            setModel={setModel}
            suggestedPrompts={currentPersona.suggestedPrompts}
            onSelectPrompt={(p) => handleSubmit(p)}
          />
        </footer>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
        onClearKey={handleClearApiKey}
      />
    </div>
  );
}
