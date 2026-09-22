"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar, ChatSession } from "@/components/Sidebar";
import { ChatMessage, MessageItem } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ApiKeyModal, ProviderConfig } from "@/components/ApiKeyModal";
import { ReasoningStep } from "@/components/ReasoningCard";
import { CHAT_MODES, ModelPersonaId } from "@/lib/agent/prompts";
import { AiBackground } from "@/components/AiBackground";
import { Sparkles, Code2, Compass, PenTool, Lightbulb } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState<ModelPersonaId>("default_assistant");
  const [model, setModel] = useState("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
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

      const savedBase = localStorage.getItem("zeenexus_base_url");
      if (savedBase) setBaseURL(savedBase);

      const savedModel = localStorage.getItem("zeenexus_model");
      if (savedModel) setModel(savedModel);

      const savedSessions = localStorage.getItem("zeenexus_chat_sessions");
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } else {
        const defaultSession: ChatSession = {
          id: "session_default",
          title: "New Chat",
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setSessions([defaultSession]);
      }

      const savedChat = localStorage.getItem("zeenexus_chat_history_session_default");
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      }
    } catch {
      // LocalStorage error handling
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const persistMessages = (sessionId: string, newMessages: MessageItem[]) => {
    try {
      localStorage.setItem(`zeenexus_chat_history_${sessionId}`, JSON.stringify(newMessages));
    } catch {
      // ignore
    }
  };

  const handleSaveConfig = (cfg: ProviderConfig) => {
    setApiKey(cfg.apiKey);
    setBaseURL(cfg.baseURL);
    setModel(cfg.model);
    localStorage.setItem("zeenexus_openai_key", cfg.apiKey);
    localStorage.setItem("zeenexus_base_url", cfg.baseURL);
    localStorage.setItem("zeenexus_model", cfg.model);
  };

  const handleClearConfig = () => {
    setApiKey("");
    setBaseURL("");
    setModel("gpt-4o-mini");
    localStorage.removeItem("zeenexus_openai_key");
    localStorage.removeItem("zeenexus_base_url");
    localStorage.removeItem("zeenexus_model");
  };

  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
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
    if (confirm("Clear this conversation?")) {
      setMessages([]);
      localStorage.removeItem(`zeenexus_chat_history_${activeSessionId}`);
    }
  };

  const handleSubmit = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || input).trim();
    if (!promptToSend || isStreaming) return;

    setInput("");

    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: promptToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update title on first message
    if (messages.length === 0) {
      const title = promptToSend.slice(0, 28) + (promptToSend.length > 28 ? "..." : "");
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, title } : s
      );
      setSessions(updatedSessions);
      localStorage.setItem("zeenexus_chat_sessions", JSON.stringify(updatedSessions));
    }

    const assistantMsgId = `ast_${Date.now()}`;
    const initialAssistantMsg: MessageItem = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
          baseURL: baseURL.trim(),
          model: model,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server error: ${res.status}`);
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
                  content: `> ⚠️ **Error:** ${errMsg}\n\nPlease check your OpenAI key settings or network connection.`,
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

  const currentMode = CHAT_MODES[currentPersonaId] || CHAT_MODES.default_assistant;

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-[#090d16]">
      {/* Dynamic Animated AI Neural Background */}
      <AiBackground />

      {/* Sidebar (ChatGPT style) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        hasKey={Boolean(apiKey || baseURL)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Minimal Header */}
        <Header
          currentPersonaId={currentPersonaId}
          onSelectPersona={setCurrentPersonaId}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
          hasCustomKey={Boolean(apiKey || baseURL)}
          onClearChat={handleClearChat}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          model={model}
          setModel={setModel}
        />

        {/* Chat Feed */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              /* Clean ChatGPT / Gemini Empty State */
              <div className="min-h-[55vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-emerald-400 mb-2 relative group">
                    <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/30 transition-all" />
                    <Sparkles className="w-7 h-7 relative z-10" />
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                    What can I help with today?
                  </h1>
                </div>

                {/* 4 Clean Prompt Cards with Glassmorphic Blur (ChatGPT / Gemini style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl text-left">
                  <button
                    type="button"
                    onClick={() => handleSubmit("Write a Python script to fetch data from a REST API and parse JSON.")}
                    className="p-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <span>Code & Algorithms</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Write a Python script to fetch data from a REST API and parse JSON.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit("Explain how neural networks learn with backpropagation in simple terms.")}
                    className="p-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>Explain Concepts</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Explain how neural networks learn with backpropagation in simple terms.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit("Help me brainstorm 5 unique features for an AI assistant application.")}
                    className="p-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Brainstorm Ideas</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Help me brainstorm 5 unique features for an AI assistant application.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit("Draft a concise professional project update email.")}
                    className="p-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                      <PenTool className="w-4 h-4 text-purple-400" />
                      <span>Draft & Write</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Draft a concise professional project update email.
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}
            <div ref={chatBottomRef} />
          </div>
        </main>

        {/* Floating Capsule Input Bar */}
        <footer className="w-full">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={() => handleSubmit()}
            onStop={handleStop}
            isStreaming={isStreaming}
            suggestedPrompts={currentMode.suggestedPrompts}
            onSelectPrompt={(p) => handleSubmit(p)}
          />
        </footer>
      </div>

      {/* API Key / Provider Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        config={{ apiKey, baseURL, model }}
        onSaveConfig={handleSaveConfig}
        onClearConfig={handleClearConfig}
      />
    </div>
  );
}
