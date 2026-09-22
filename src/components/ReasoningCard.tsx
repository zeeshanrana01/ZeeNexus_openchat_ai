"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Cpu, Sparkles, Terminal, CheckCircle2 } from "lucide-react";

export interface ReasoningStep {
  thought?: string;
  toolName?: string;
  args?: string;
  output?: string;
}

interface ReasoningCardProps {
  steps: ReasoningStep[];
  isStreaming?: boolean;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({ steps, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-md overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-emerald-900/15 hover:bg-emerald-900/30 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            {isStreaming ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-300" />
            ) : (
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Agent Reasoning & Action Trace
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {steps.length} {steps.length === 1 ? "step" : "steps"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400/80">
          <span>{isExpanded ? "Hide Trace" : "View Trace"}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Body details */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 text-xs border-t border-emerald-500/10 divide-y divide-emerald-500/10">
          {steps.map((step, idx) => (
            <div key={idx} className={idx > 0 ? "pt-2.5" : ""}>
              {/* Internal Thought */}
              {step.thought && (
                <div className="flex items-start gap-2 mb-2 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="leading-relaxed">
                    <span className="font-semibold text-emerald-400 mr-1.5">Thought:</span>
                    <span>{step.thought}</span>
                  </div>
                </div>
              )}

              {/* Tool Execution Invocation */}
              {step.toolName && (
                <div className="space-y-1.5 bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-mono font-medium">
                      <Terminal className="w-3.5 h-3.5" />
                      Tool Call: <span className="text-amber-300">{step.toolName}()</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" /> executed
                    </span>
                  </div>

                  {step.args && (
                    <div className="text-[11px] font-mono text-slate-400 bg-black/40 rounded p-1.5 overflow-x-auto">
                      <span className="text-slate-500">args: </span>
                      {step.args}
                    </div>
                  )}

                  {step.output && (
                    <div className="text-[11px] font-mono text-slate-300 bg-slate-950/90 rounded p-2 overflow-x-auto border border-slate-800/80 max-h-48 overflow-y-auto">
                      <span className="text-slate-500 block mb-0.5">output:</span>
                      <pre className="whitespace-pre-wrap">{step.output}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
