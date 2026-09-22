"use client";

import React, { useState, useEffect } from "react";
import { Key, X, ExternalLink, Check, ShieldCheck, Trash2, Cpu, Sparkles, Globe, Server } from "lucide-react";

export interface ProviderConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProviderConfig;
  onSaveConfig: (cfg: ProviderConfig) => void;
  onClearConfig: () => void;
}

export const PROVIDER_PRESETS = [
  {
    id: "openai",
    name: "OpenAI",
    icon: Sparkles,
    badge: "Official",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60",
    baseURL: "",
    defaultModel: "gpt-4o-mini",
    placeholderKey: "sk-proj-...",
    requiresKey: true,
    helpUrl: "https://platform.openai.com/api-keys",
    helpText: "Get OpenAI API key",
    desc: "Direct access to GPT-4o and GPT-4o-mini.",
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    icon: Cpu,
    badge: "100% Free & Local",
    badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800/60",
    baseURL: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    placeholderKey: "Not needed (ollama)",
    requiresKey: false,
    helpUrl: "https://ollama.com",
    helpText: "Download Ollama",
    desc: "Run Llama 3.2, Mistral, or DeepSeek locally on your PC.",
  },
  {
    id: "groq",
    name: "Groq Cloud",
    icon: Server,
    badge: "Free Cloud Key",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-800/60",
    baseURL: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    placeholderKey: "gsk_...",
    requiresKey: true,
    helpUrl: "https://console.groq.com/keys",
    helpText: "Get free Groq key",
    desc: "Ultra-fast inference for Llama 3.3 with generous free tier.",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: Globe,
    badge: "Open Source Hub",
    badgeColor: "text-purple-400 bg-purple-950/60 border-purple-800/60",
    baseURL: "https://openrouter.ai/api/v1",
    defaultModel: "deepseek/deepseek-r1:free",
    placeholderKey: "sk-or-...",
    requiresKey: true,
    helpUrl: "https://openrouter.ai/keys",
    helpText: "Get OpenRouter key",
    desc: "Access hundreds of open-source and free AI models.",
  },
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onClearConfig,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [baseURL, setBaseURL] = useState(config.baseURL);
  const [model, setModel] = useState(config.model);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setApiKey(config.apiKey);
    setBaseURL(config.baseURL);
    setModel(config.model);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PROVIDER_PRESETS[0]) => {
    setBaseURL(preset.baseURL);
    setModel(preset.defaultModel);
    if (!preset.requiresKey && !apiKey) {
      setApiKey("ollama");
    }
  };

  const handleSave = () => {
    onSaveConfig({
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim(),
      model: model.trim() || "gpt-4o-mini",
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setApiKey("");
    setBaseURL("");
    setModel("gpt-4o-mini");
    onClearConfig();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#0f172a] shadow-2xl p-6 text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">AI Provider & Key Settings</h3>
              <p className="text-xs text-slate-400">Use OpenAI, Ollama (Local Free), Groq, or OpenRouter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* 1-Click Provider Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Preset Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDER_PRESETS.map((p) => {
                const isSelected = baseURL === p.baseURL;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-slate-800 border-emerald-500/60 shadow-sm"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Icon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{p.name}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug line-clamp-1">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                API Key
              </label>
              {baseURL.includes("11434") && (
                <span className="text-[10px] text-cyan-400 font-mono">Not required for Ollama</span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={baseURL.includes("11434") ? "ollama (optional)" : "sk-..."}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Base URL (Optional / Ollama / Groq / OpenRouter) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Base URL (OpenAI-compatible)
              </label>
              <span className="text-[10px] text-slate-500">Leave blank for official OpenAI</span>
            </div>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com/v1 or http://localhost:11434/v1"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Model Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Model Identifier
              </label>
              <span className="text-[10px] text-slate-500">e.g. gpt-4o-mini, llama3.2, mistral</span>
            </div>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local Storage Privacy:</span>
            </div>
            <p className="text-slate-400">
              Credentials are saved only in your local browser (<code className="text-cyan-400">localStorage</code>) and are sent directly to your Next.js serverless chat route.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {apiKey || baseURL ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
