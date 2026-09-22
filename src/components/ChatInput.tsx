"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Square, Sparkles } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isStreaming: boolean;
  suggestedPrompts?: string[];
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  onStop,
  isStreaming,
  suggestedPrompts = [],
  onSelectPrompt,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Suggestions Row (ChatGPT & Gemini style prompt pills) */}
      {suggestedPrompts.length > 0 && !isStreaming && input.length === 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none text-xs">
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/70 transition-all text-xs text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Main Pill / Capsule Input Box (ChatGPT & Gemini style) */}
      <div className="relative rounded-3xl border border-slate-700/80 bg-[#161d2b] shadow-xl focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message OpenChat AI..."
          rows={1}
          className="w-full bg-transparent px-5 pt-3.5 pb-3.5 pr-14 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none min-h-[48px] max-h-[180px]"
        />

        {/* Action Button: Round send / stop icon on the right */}
        <div className="absolute right-2.5 bottom-2">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 hover:bg-white text-slate-900 shadow-md transition-all"
              title="Stop Generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!input.trim()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 hover:bg-white disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 transition-all"
              title="Send Message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      <div className="text-center pt-2 text-[11px] text-slate-500">
        OpenChat AI can make mistakes. Verify important information.
      </div>
    </div>
  );
};
