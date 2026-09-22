"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, User } from "lucide-react";
import { ReasoningCard, ReasoningStep } from "./ReasoningCard";

export interface MessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
  reasoningSteps?: ReasoningStep[];
  isStreaming?: boolean;
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
    <div className="my-3 rounded-xl overflow-hidden border border-slate-750 bg-[#0d121c] text-slate-200">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#151d2e] border-b border-slate-800 text-[11px] text-slate-400">
        <span className="font-mono text-slate-300 font-semibold uppercase">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 hover:text-white transition-colors"
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
      <div className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed bg-[#0b0f17]">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

function FormattedContent({ text }: { text: string }) {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose-custom space-y-2 text-[14px] leading-relaxed text-slate-200">
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

        const paragraphs = part.split("\n\n");
        return (
          <React.Fragment key={index}>
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={pIdx} className="text-base font-bold text-white mt-3 mb-1.5">
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

              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote key={pIdx} className="border-l-2 border-slate-600 pl-3 italic text-slate-400 my-2">
                    {renderInline(trimmed.replace(/^>\s*/gm, ""))}
                  </blockquote>
                );
              }

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

function renderInline(text: string) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-slate-800 text-slate-200 font-mono text-[12px] px-1.5 py-0.5 rounded border border-slate-700"
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
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
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
      className={`group w-full max-w-3xl mx-auto flex gap-4 py-4 px-3 sm:px-4 rounded-2xl transition-colors ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar (Shown only on assistant side) */}
      {!isUser && (
        <div className="shrink-0 pt-0.5">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`relative ${
          isUser
            ? "bg-[#1f293d] text-slate-100 rounded-3xl px-4 py-2.5 max-w-[85%] sm:max-w-[75%]"
            : "flex-1 min-w-0"
        }`}
      >
        {/* Reasoning and Tools trace (collapsible) */}
        {!isUser && message.reasoningSteps && message.reasoningSteps.length > 0 && (
          <ReasoningCard steps={message.reasoningSteps} isStreaming={message.isStreaming} />
        )}

        {/* Text Body */}
        <FormattedContent text={message.content} />

        {/* Streaming Cursor */}
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-slate-300 animate-pulse align-middle" />
        )}

        {/* Copy action on assistant message hover */}
        {!isUser && !message.isStreaming && message.content && (
          <div className="mt-2 flex items-center gap-2 text-slate-400">
            <button
              onClick={handleCopyMessage}
              type="button"
              className="p-1 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs flex items-center gap-1"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar (Optional on user side) */}
      {isUser && (
        <div className="shrink-0 pt-0.5 hidden sm:block">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};
