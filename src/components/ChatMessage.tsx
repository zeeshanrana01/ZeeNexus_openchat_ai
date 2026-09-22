"use client";

import React, { useState } from "react";
import { Copy, Check, User, Bot, Sparkles } from "lucide-react";
import { ReasoningCard, ReasoningStep } from "./ReasoningCard";

export interface MessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
  reasoningSteps?: ReasoningStep[];
  isStreaming?: boolean;
  personaAvatar?: string;
  personaName?: string;
}

interface ChatMessageProps {
  message: MessageItem;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700/80 bg-[#0d131f] text-slate-200">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#151f33] border-b border-slate-800 text-[11px] text-slate-400">
        <span className="font-mono text-cyan-400 uppercase tracking-wider font-semibold">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed bg-[#0b101a]">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

// Clean lightweight Markdown renderer without bulky dependencies
function FormattedContent({ text }: { text: string }) {
  if (!text) return null;

  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose-custom space-y-2 text-[14px] leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          let language = "text";
          let codeContent = "";

          if (firstLine && !firstLine.includes(" ") && lines.length > 1) {
            language = firstLine;
            codeContent = lines.slice(1).join("\n");
          } else {
            codeContent = lines.join("\n");
          }

          return <CodeBlock key={index} language={language} code={codeContent} />;
        }

        // Standard text lines
        const paragraphs = part.split("\n\n");
        return (
          <React.Fragment key={index}>
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Headings
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={pIdx} className="text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    {renderInline(trimmed.replace(/^###\s+/, ""))}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={pIdx} className="text-lg font-bold text-white mt-4 mb-2">
                    {renderInline(trimmed.replace(/^##\s+/, ""))}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={pIdx} className="text-xl font-extrabold text-white mt-4 mb-2">
                    {renderInline(trimmed.replace(/^#\s+/, ""))}
                  </h1>
                );
              }

              // Blockquotes
              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote key={pIdx} className="border-l-2 border-emerald-500 pl-3 italic text-slate-300 my-2">
                    {renderInline(trimmed.replace(/^>\s*/gm, ""))}
                  </blockquote>
                );
              }

              // List items
              const lines = trimmed.split("\n");
              const isList = lines.every((l) => /^\s*([*\-+]|\d+\.)\s+/.test(l));

              if (isList) {
                return (
                  <ul key={pIdx} className="list-disc pl-5 space-y-1 text-slate-200">
                    {lines.map((l, lIdx) => {
                      const cleanLine = l.replace(/^\s*([*\-+]|\d+\.)\s+/, "");
                      return <li key={lIdx}>{renderInline(cleanLine)}</li>;
                    })}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="text-slate-200">
                  {renderInline(trimmed)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Inline formatting: **bold**, *italic*, `inline-code`, [links]
function renderInline(text: string) {
  // Simple token parser
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-slate-800/80 text-cyan-300 font-mono text-[12px] px-1.5 py-0.5 rounded border border-cyan-500/20"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={i} className="italic text-slate-300">{token.slice(1, -1)}</em>;
    }
    if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const match = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            {match[1]}
          </a>
        );
      }
    }
    return token;
  });
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`group relative flex gap-3.5 py-4 px-4 rounded-2xl transition-all duration-200 ${
        isUser
          ? "bg-gradient-to-r from-emerald-950/30 to-slate-900/40 border border-emerald-500/20 ml-auto max-w-[85%] md:max-w-[75%]"
          : "bg-[#0c121e]/80 border border-slate-800/80 w-full"
      }`}
    >
      {/* Avatar icon */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/30 font-semibold text-xs border border-white/10">
            {message.personaAvatar || <Bot className="w-4 h-4" />}
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {isUser ? "You" : message.personaName || "ZeeNexus AI Agent"}
            </span>
            {message.createdAt && (
              <span className="text-[10px] text-slate-500">{message.createdAt}</span>
            )}
            {!isUser && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Agentic
              </span>
            )}
          </div>

          <button
            onClick={handleCopyMessage}
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Copy message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Reasoning and Tools trace */}
        {!isUser && message.reasoningSteps && message.reasoningSteps.length > 0 && (
          <ReasoningCard steps={message.reasoningSteps} isStreaming={message.isStreaming} />
        )}

        {/* Formatted Content */}
        <FormattedContent text={message.content} />

        {/* Streaming Cursor */}
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};
