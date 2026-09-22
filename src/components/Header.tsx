"use client";

import React, { useState } from "react";
import { Sparkles, Key, Trash2, Menu, ChevronDown, Check, Plus } from "lucide-react";
import { CHAT_MODES, ModelPersonaId } from "@/lib/agent/prompts";

interface HeaderProps {
  currentPersonaId: ModelPersonaId;
  onSelectPersona: (id: ModelPersonaId) => void;
  onOpenKeyModal: () => void;
  hasCustomKey: boolean;
  onClearChat: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  model: string;
  setModel: (m: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersonaId,
  onSelectPersona,
  onOpenKeyModal,
  hasCustomKey,
  onClearChat,
  onNewChat,
  onToggleSidebar,
  model,
  setModel,
}) => {
  const currentMode = CHAT_MODES[currentPersonaId] || CHAT_MODES.default_assistant;
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#0e131f]/90 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left: Sidebar toggle & Model Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model / Mode Dropdown (ChatGPT & Gemini style) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/80 text-sm font-semibold text-slate-200 transition-colors"
            >
              <span>{model}</span>
              <span className="text-slate-500 font-normal text-xs">• {currentMode.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {modelDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-64 rounded-2xl border border-slate-750 bg-[#141b2a] shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-100">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                  OpenAI Model
                </div>
                {[
                  { id: "gpt-4o-mini", label: "gpt-4o-mini", desc: "Fast & lightweight" },
                  { id: "gpt-4o", label: "gpt-4o", desc: "Advanced reasoning" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setModel(m.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                      model === m.id
                        ? "bg-slate-800 text-emerald-400 font-medium"
                        : "hover:bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{m.label}</div>
                      <div className="text-[10px] text-slate-400">{m.desc}</div>
                    </div>
                    {model === m.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}

                <div className="border-t border-slate-800 my-1 pt-1">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                    Assistant Mode
                  </div>
                  {(Object.keys(CHAT_MODES) as ModelPersonaId[]).map((id) => {
                    const p = CHAT_MODES[id];
                    const isSelected = id === currentPersonaId;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          onSelectPersona(id);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                          isSelected
                            ? "bg-slate-800 text-emerald-400 font-medium"
                            : "hover:bg-slate-800/60 text-slate-300"
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onNewChat}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="New Chat"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button
            onClick={onOpenKeyModal}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors relative"
            title="API Key Configuration"
          >
            <Key className="w-4 h-4" />
            <span
              className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                hasCustomKey ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </button>

          <button
            onClick={onClearChat}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
