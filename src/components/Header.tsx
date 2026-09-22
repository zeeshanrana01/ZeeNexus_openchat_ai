"use client";

import React from "react";
import { Sparkles, Key, Github, Trash2, Menu, ChevronDown, Check } from "lucide-react";
import { AGENT_PERSONAS, AgentPersonaId } from "@/lib/agent/prompts";

interface HeaderProps {
  currentPersonaId: AgentPersonaId;
  onSelectPersona: (id: AgentPersonaId) => void;
  onOpenKeyModal: () => void;
  hasCustomKey: boolean;
  onClearChat: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersonaId,
  onSelectPersona,
  onOpenKeyModal,
  hasCustomKey,
  onClearChat,
  onToggleSidebar,
}) => {
  const currentPersona = AGENT_PERSONAS[currentPersonaId] || AGENT_PERSONAS.zeenexus_core;
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-xl px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold text-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  ZeeNexus <span className="text-emerald-400">OpenChat AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Portfolio Agent
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                By Rana Zeeshan • Agentic AI & Full-Stack
              </p>
            </div>
          </div>
        </div>

        {/* Center: Persona Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-xs text-slate-200 transition-all shadow-sm"
          >
            <span className="text-sm">{currentPersona.avatar}</span>
            <span className="font-medium hidden sm:inline">{currentPersona.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-64 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                Select Agent Persona
              </div>
              {(Object.keys(AGENT_PERSONAS) as AgentPersonaId[]).map((id) => {
                const p = AGENT_PERSONAS[id];
                const isSelected = id === currentPersonaId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSelectPersona(id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                      isSelected
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{p.avatar}</span>
                      <div className="truncate">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.tagline}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Key Settings Button */}
          <button
            onClick={onOpenKeyModal}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs transition-colors"
            title="OpenAI Key Configuration"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {hasCustomKey ? "Custom Key Active" : "Key Settings"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasCustomKey ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={onClearChat}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Reset & Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* GitHub Repo Button */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="View on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
