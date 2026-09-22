import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "ZeeNexus OpenChat AI | Rana Zeeshan — Agentic AI Portfolio",
  description:
    "An autonomous Agentic AI OpenChat web application by Rana Zeeshan (ZeeNexus), featuring ReAct tool calling, multi-persona reasoning, SSE streaming, and Next.js / Python architecture.",
  keywords: [
    "Agentic AI",
    "Rana Zeeshan",
    "ZeeNexus",
    "OpenChat AI",
    "Next.js",
    "React",
    "TypeScript",
    "Python AI Agent",
    "OpenAI API",
    "ReAct Loop",
    "Portfolio"
  ],
  authors: [{ name: "Rana Zeeshan", url: "https://github.com" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
