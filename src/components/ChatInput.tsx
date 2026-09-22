"use client";

import React, { useRef, useEffect } from "react";
import { Send, Square, Sparkles, Terminal } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isStreaming: boolean;
  model: string;
  setModel: (m: string) => void;
  suggestedPrompts?: string[];
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  onStop,
  isStreaming,
  model,
  setModel,
  suggestedPrompts = [],
  onSelectPrompt,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Suggestions Row (shown when chat is ready) */}
      {suggestedPrompts.length > 0 && !isStreaming && input.length === 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Prompts:
          </span>
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 transition-all text-xs text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ZeeNexus OpenChat AI anything... (e.g. skills, projects, code architecture, or agentic tools)"
          rows={1}
          className="w-full bg-transparent px-4 pt-3.5 pb-12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none min-h-[54px] max-h-[180px]"
        />

        {/* Action Controls Bar */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Model Selector & Capabilities */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-[11px] bg-slate-800/90 hover:bg-slate-800 text-slate-300 font-mono px-2.5 py-1 rounded-md border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Fast & Efficient)</option>
              <option value="gpt-4o">gpt-4o (Deep Reasoning)</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
            </select>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <Terminal className="w-3 h-3" /> ReAct Tools Active
            </span>
          </div>

          {/* Submit / Stop Button */}
          <div className="pointer-events-auto">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/40 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!input.trim()}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold shadow-lg shadow-emerald-900/30 transition-all disabled:shadow-none"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
        <span>Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400 text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400 text-[10px]">Shift+Enter</kbd> for new line</span>
        <span>ZeeNexus OpenChat • Next.js & OpenAI Architecture</span>
      </div>
    </div>
  );
};
