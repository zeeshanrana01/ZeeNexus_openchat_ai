"use client";

import React from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  ExternalLink,
  Code2,
  BrainCircuit,
  Globe,
  Github
} from "lucide-react";
import { PORTFOLIO_DATA } from "@/lib/agent/portfolio-data";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onTriggerToolDemo: (toolQuery: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTriggerToolDemo,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#0c1220] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top: Header & New Chat */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-3 md:hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onNewChat}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Center: Conversation History & Quick Tools */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* History List */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Recent Conversations
            </div>

            {sessions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-xl border border-slate-800/40">
                No active conversations yet. Start a new topic!
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelectSession(s.id)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                        isActive
                          ? "bg-slate-800 text-emerald-400 font-medium border border-emerald-500/20"
                          : "text-slate-300 hover:bg-slate-900/80 hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{s.title || "Chat Session"}</span>
                      </div>
                      <button
                        onClick={(e) => onDeleteSession(s.id, e)}
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Agentic Tool Triggers */}
          <div className="pt-2 border-t border-slate-800/60">
            <div className="px-2 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-3 h-3 text-cyan-400" />
              Quick Agent Tools
            </div>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => onTriggerToolDemo("Tell me about Rana Zeeshan's Agentic AI skills and experience.")}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 transition-colors flex items-center justify-between"
              >
                <span>🔍 Search Skills</span>
                <span className="text-[10px] text-slate-600 font-mono">portfolio()</span>
              </button>
              <button
                type="button"
                onClick={() => onTriggerToolDemo("List all featured projects built by Rana Zeeshan with tech stacks.")}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 transition-colors flex items-center justify-between"
              >
                <span>📂 Featured Projects</span>
                <span className="text-[10px] text-slate-600 font-mono">projects()</span>
              </button>
              <button
                type="button"
                onClick={() => onTriggerToolDemo("Calculate 2^32 and show step-by-step logic.")}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 transition-colors flex items-center justify-between"
              >
                <span>🧮 Compute Expression</span>
                <span className="text-[10px] text-slate-600 font-mono">calc()</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Portfolio Profile Card */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#090d16]/70">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-sm">
                RZ
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">
                  {PORTFOLIO_DATA.developer.name}
                </div>
                <div className="text-[10px] text-emerald-400 truncate">
                  {PORTFOLIO_DATA.developer.brand}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2.5">
              {PORTFOLIO_DATA.developer.title}
            </p>

            <div className="flex flex-wrap gap-1 mb-2.5">
              {["Agentic AI", "Python", "Next.js", "TypeScript"].map((skill, i) => (
                <span
                  key={i}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-[11px]"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://zeenexus.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors text-[11px]"
              >
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
