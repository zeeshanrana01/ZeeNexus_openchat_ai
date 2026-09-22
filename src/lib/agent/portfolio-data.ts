export interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: "Completed" | "Active" | "Featured";
}

export interface PortfolioData {
  developer: {
    name: string;
    brand: string;
    title: string;
    tagline: string;
    bio: string;
    location: string;
    skills: {
      category: string;
      items: string[];
    }[];
    socialLinks: {
      platform: string;
      url: string;
    }[];
  };
  projects: Project[];
  capabilities: string[];
}

export const PORTFOLIO_DATA: PortfolioData = {
  developer: {
    name: "Rana Zeeshan",
    brand: "ZeeNexus",
    title: "Agentic AI & Full-Stack Engineer",
    tagline: "Building autonomous AI agents, intelligent systems, and scalable modern web platforms.",
    bio: "Rana Zeeshan is a forward-thinking AI Engineer and Full-Stack Developer specializing in Agentic AI architectures, LLM tool-calling workflows, Next.js/React ecosystems, and robust Python backends. Passionate about creating self-reflecting, tool-augmented autonomous agents that deliver real-world utility.",
    location: "Global / Remote",
    skills: [
      {
        category: "Agentic AI & LLMs",
        items: [
          "ReAct Agent Architectures",
          "Tool & Function Calling",
          "OpenAI API (GPT-4o, GPT-4o-mini)",
          "Multi-Agent Coordination",
          "Prompt Engineering & Chain-of-Thought",
          "Autonomous Workflows"
        ],
      },
      {
        category: "Frontend & UI/UX",
        items: [
          "Next.js 14 / 15 (App Router)",
          "React.js",
          "TypeScript",
          "JavaScript (ESNext)",
          "Tailwind CSS",
          "Glassmorphic Design",
          "Responsive Layouts"
        ],
      },
      {
        category: "Backend & Systems",
        items: [
          "Node.js & Next.js Serverless Route Handlers",
          "Python (AI scripting & pipelines)",
          "RESTful APIs & SSE Streaming",
          "Vercel Deployment & Edge Functions",
          "Git & GitHub CI/CD"
        ],
      },
    ],
    socialLinks: [
      { platform: "GitHub", url: "https://github.com" },
      { platform: "Portfolio", url: "https://zeenexus.dev" },
      { platform: "LinkedIn", url: "https://linkedin.com" },
    ],
  },
  projects: [
    {
      title: "ZeeNexus OpenChat AI",
      description: "An autonomous, portfolio-integrated AI agent web application featuring live tool-calling, multi-persona switching, streaming response engine, and dual API key management with local execution and Vercel cloud deployment.",
      techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "OpenAI API", "Python"],
      status: "Featured",
    },
    {
      title: "Autonomous Python Agent Framework",
      description: "A lightweight, modular Python agent implementing the ReAct pattern for automated tool execution, web research, and programmatic problem solving.",
      techStack: ["Python 3", "OpenAI SDK", "AsyncIO", "JSON Schema"],
      status: "Featured",
    },
    {
      title: "Next.js AI Enterprise Dashboard",
      description: "Modern glassmorphic analytics dashboard visualizing real-time AI metrics, token consumption, and agent operation logs.",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Lucide React"],
      status: "Completed",
    },
  ],
  capabilities: [
    "Autonomous decision making with structured function calling",
    "Real-time streaming chat completions with Server-Sent Events (SSE)",
    "Interactive code analysis, debugging, and algorithmic generation",
    "Portfolio and professional background exploration for recruiters and clients",
    "Local offline simulation fallback when API keys are not supplied"
  ],
};
