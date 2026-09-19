/*
  Shared portfolio content — extracted from Home.tsx so the data
  is reusable across pages (Projects list, ProjectDetails, etc.)
  while Home keeps its existing visual structure unchanged.
*/

export const GITHUB_USER = "Praveenmanoharand";
export const EMAIL = "praveenmanoharan.dev@gmail.com";

export const githubUrl = (user = GITHUB_USER) =>
  `https://github.com/${user}`;

export const mailTo = (email = EMAIL) => `mailto:${email}`;

/* ── services ─────────────────────────────────────────── */

export const services: Array<[string, string, string]> = [
  [
    "01",
    "Product architecture",
    "Deciding the shape of a product up front — data, states, boundaries — so features can be added later without a rewrite.",
  ],
  [
    "02",
    "Interface engineering",
    "Interfaces that stay fast and legible on a bad connection: real loading states, real empty states, real keyboard support.",
  ],
  [
    "03",
    "Full-stack delivery",
    "Wiring the screen to the service. Auth, persistence, background work, and the deploy that puts it in front of users.",
  ],
  [
    "04",
    "Design systems",
    "A small set of tokens and components that make the tenth screen as consistent as the first — and quicker to build.",
  ],
  [
    "05",
    "Technical direction",
    "Choosing the boring, reliable option on purpose, and cutting scope until a first version can actually ship.",
  ],
];

/* ── projects ─────────────────────────────────────────── */

export type Project = {
  index: string;
  name: string;
  tag: string;
  context: string;
  title: string;
  description: string;
  href: string;
  image: string;
  accent: "cobalt" | "tomato" | "lime";
  figureTag: string;
  stack: string;
  role: string;
  evidence: Array<[string, string]>;
};

export const projects: Project[] = [
  {
    index: "01",
    name: "ProposeAI",
    tag: "Full-stack / live",
    context: "Product build",
    title: "Turn a brief into a proposal.",
    description:
      "An AI-assisted proposal workspace: prompt-driven generation, saved history, rendered preview, and PDF export for delivery.",
    href: "https://proposal-ai-inky.vercel.app/",
    image: "/manus-storage/proposeai_7fe6f63d.webp",
    accent: "cobalt",
    figureTag: "Dashboard / generator",
    stack: "React · Node · AI generation · PDF export",
    role: "Product thinking, frontend, backend, launch",
    evidence: [
      ["Surface", "Generator, history, preview, export"],
      ["State", "Live on Vercel"],
    ],
  },
  {
    index: "02",
    name: "Aura AI",
    tag: "Backend / live",
    context: "Systems build",
    title: "The door before the product.",
    description:
      "A focused authentication gateway — login, registration, password recovery, and account access that persists across sessions.",
    href: "https://chatbot-ai-one-green.vercel.app/",
    image: "/manus-storage/aura-ai_11e2eeb8.webp",
    accent: "tomato",
    figureTag: "Secure login",
    stack: "Auth flows · Session handling · Recovery",
    role: "Backend, session design, frontend integration",
    evidence: [
      ["Surface", "Login, register, recovery, session"],
      ["State", "Live on Vercel"],
    ],
  },
  {
    index: "03",
    name: "Signal / System",
    tag: "Design system / 2026",
    context: "Studio build",
    title: "The system this page runs on.",
    description:
      "A token-driven design language — fluid type scale, ink and cream surfaces, one signal colour, and a scroll-linked canvas stage.",
    href: "/projects/signal-system",
    image: "",
    accent: "lime",
    figureTag: "Procedural frame field",
    stack: "Design tokens · Fluid type · Canvas sequence",
    role: "Design language, typography, motion system",
    evidence: [
      ["Surface", "Tokens, type scale, motion primitives"],
      ["State", "In use across this site"],
    ],
  },
];

/* ── experiments ──────────────────────────────────────── */

export type Experiment = {
  number: string;
  category: "frontend" | "backend" | "full-stack";
  label: string;
  title: string;
  stack: string;
  href: string;
  image: string;
  copy: string;
};

export const experiments: Experiment[] = [
  {
    number: "01",
    category: "backend",
    label: "Backend",
    title: "Aura AI secure gateway",
    stack: "Auth · Session flows",
    href: "https://chatbot-ai-one-green.vercel.app/",
    image: "/manus-storage/aura-ai_11e2eeb8.webp",
    copy: "A focused authentication gateway with login, registration, password recovery, and persistent account access.",
  },
  {
    number: "02",
    category: "full-stack",
    label: "Full-stack",
    title: "ProposeAI proposal engine",
    stack: "AI · Dashboard · PDF",
    href: "https://proposal-ai-inky.vercel.app/",
    image: "/manus-storage/proposeai_7fe6f63d.webp",
    copy: "An AI-assisted proposal workspace with prompt-driven generation, history, rendered previews, and PDF export.",
  },
  {
    number: "03",
    category: "full-stack",
    label: "Full-stack",
    title: "Team launch workspace",
    stack: "React · Node.js",
    href: "/projects",
    image: "",
    copy: "A collaborative workspace connecting a calm interface to workflows, permissions, and persistent project data.",
  },
  {
    number: "04",
    category: "frontend",
    label: "Frontend",
    title: "Design system playground",
    stack: "React · Storybook",
    href: "/projects",
    image: "",
    copy: "A component lab for testing reusable patterns, responsive states, and the accessible details that get skipped.",
  },
  {
    number: "05",
    category: "backend",
    label: "Backend",
    title: "Event ingestion service",
    stack: "Node.js · Redis",
    href: "/projects",
    image: "",
    copy: "A small pipeline for receiving, validating, and routing product activity to whatever needs to hear about it.",
  },
  {
    number: "06",
    category: "full-stack",
    label: "Full-stack",
    title: "Client portal rebuild",
    stack: "React · Express",
    href: "/projects",
    image: "",
    copy: "One portal flow covering onboarding, records, and account actions instead of three disconnected screens.",
  },
];

export const experimentFilters = ["All", "Frontend", "Backend", "Full-stack"];

/* ── now / beyond / principles ────────────────────────── */

export const nowItems: Array<[string, string]> = [
  [
    "Building",
    "Deepening ProposeAI's export pipeline — better templates, cleaner PDFs, fewer surprises between preview and download.",
  ],
  [
    "Learning",
    "Systems design at the seams: queues, retries, idempotency, and the failure modes that only appear in production.",
  ],
  [
    "Exploring",
    "Scroll-linked interfaces — how far canvas and pinned layout can be pushed before a page stops feeling calm.",
  ],
  [
    "Focus",
    "Product work with small teams where I can own the interface and the service sitting behind it.",
  ],
];

export const beyondItems: Array<[string, string, string, string]> = [
  [
    "01",
    "Motion",
    "Frame studies",
    "Rendering short sequences, then scrubbing them by hand to feel where the timing sits.",
  ],
  [
    "02",
    "Type",
    "Editorial layout",
    "Hierarchy, optical spacing, and how much weight a single headline can carry.",
  ],
  [
    "03",
    "Edit",
    "Build timelapses",
    "Cutting long build sessions into thirty-second clips. Mostly pacing practice.",
  ],
  [
    "04",
    "Colour",
    "One-signal palettes",
    "Systems built from a single accent colour and a lot of restraint about using it.",
  ],
  [
    "05",
    "Photo",
    "Structure & shadow",
    "Photographing buildings and light. Where most of the grid instincts come from.",
  ],
];

export const principles: Array<[string, string, string]> = [
  [
    "01",
    "Make the path obvious",
    "If someone has to guess what happens next, the interface has failed. I'd rather cut a feature than add an explanation.",
  ],
  [
    "02",
    "Make the details count",
    "Performance, accessibility, error states and edge cases are the work — not the polish pass after the work.",
  ],
  [
    "03",
    "Ship, then learn",
    "Get the riskiest part in front of real use early. Keep the version that makes the whole product simpler.",
  ],
];

/* ── site rail (in-page anchors on home) ──────────────── */

export const railSections: Array<[string, string]> = [
  ["top", "Start"],
  ["about", "About"],
  ["services", "Services"],
  ["projects", "Projects"],
  ["experiments", "Experiments"],
  ["now", "Now"],
  ["beyond-code", "Beyond code"],
  ["github-activity", "GitHub"],
  ["principles", "Notes"],
  ["resume", "Resume"],
  ["contact", "Contact"],
  ["final-cta", "Close"],
];

/* ── nav / footer link groups ─────────────────────────── */

export const navLinks: Array<{ id: string; label: string; num: string; to: string }> = [
  { id: "about", label: "About", num: "01", to: "/about" },
  { id: "services", label: "Services", num: "02", to: "/#services" },
  { id: "projects", label: "Projects", num: "03", to: "/projects" },
  { id: "experiments", label: "Experiments", num: "04", to: "/#experiments" },
  { id: "contact", label: "Contact", num: "05", to: "/contact" },
];

/* ── about / bio ──────────────────────────────────────── */

export const about = {
  lead:
    "I'm a full-stack developer who spends most of his time turning vague ideas into things people can actually use.",
  body: [
    "That usually means starting further back than the screen — what the data really looks like, which states exist, and where the thing will break under load. The interface gets easier once that is settled.",
    "I like small teams and short feedback loops, work that has a real user on the other end, and shipping something modest that holds up rather than something ambitious that doesn't.",
  ],
  stack: [
    "TypeScript",
    "React",
    "Node",
    "Postgres",
    "Tailwind",
    "Framer",
    "Vite",
    "Figma",
  ],
  stats: [
    { no: "02", label: "Live products" },
    { no: "06", label: "Lab builds" },
    { no: "01", label: "Design system" },
  ] as Array<{ no: string; label: string }>,
  location: "Tamil Nadu, IN",
  coords: ["10.79°N", "78.70°E"],
};

/* ── skills ───────────────────────────────────────────── */

export type Skill = {
  name: string;
  level: "expert" | "advanced" | "comfortable";
};

export const skills: Skill[] = [
  { name: "TypeScript", level: "expert" },
  { name: "React", level: "expert" },
  { name: "Node.js", level: "expert" },
  { name: "Postgres", level: "advanced" },
  { name: "Tailwind CSS", level: "expert" },
  { name: "Framer Motion", level: "advanced" },
  { name: "Vite", level: "expert" },
  { name: "GraphQL", level: "advanced" },
  { name: "Redis", level: "comfortable" },
  { name: "Docker", level: "advanced" },
  { name: "Figma", level: "advanced" },
  { name: "UI Design", level: "advanced" },
  { name: "Git / CI", level: "expert" },
  { name: "Testing", level: "advanced" },
];

export const skillLevels: Record<Skill["level"], string> = {
  expert: "Expert",
  advanced: "Advanced",
  comfortable: "Comfortable",
};

/* ── experience ───────────────────────────────────────── */

export type Experience = {
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
};

export const experience: Experience[] = [
  {
    role: "Full-stack developer",
    company: "ProposeAI",
    period: "2024 — Present",
    location: "Remote",
    description:
      "Product thinking, frontend, backend, and launch. Built the AI-assisted proposal workspace from zero to a live product on Vercel.",
  },
  {
    role: "Backend developer",
    company: "Aura AI",
    period: "2023 — 2024",
    location: "Remote",
    description:
      "Designed and implemented authentication flows, session handling, and password recovery for a live authentication gateway.",
  },
  {
    role: "Frontend developer",
    company: "Signal / System",
    period: "2026 — Present",
    location: "Remote",
    description:
      "Designed and built this portfolio's design language, motion system, and scroll-linked canvas stage in a Signal / System idiom.",
  },
  {
    role: "Full-stack contractor",
    company: "Various studios",
    period: "2021 — 2023",
    location: "Remote",
    description:
      "Shipped client portals, design system components, and event ingestion pipelines for small product teams.",
  },
];

/* ── resume / profile ─────────────────────────────────── */

export const resumeSummary =
  "A concise view of the work — I design the structure, build the interface, and stand up the services behind it.";

export const resumeHighlights = [
  ["ProposeAI", "AI proposal workspace — live on Vercel"],
  ["Aura AI", "Auth gateway — login, register, recovery"],
  ["Signal / System", "Design system running this site"],
  ["GitHub", `${GITHUB_USER} · ${projects.length} public repos`],
];

/* ── contact ──────────────────────────────────────────── */

export const contactCopy = {
  lead: "Let's get in touch.",
  copy:
    "Got something in mind? Tell me what it needs to do and who it's for. A new product, a sharper interface, or a backend that has to hold up — all fair game.",
  replyTime: "≤ 48 hours",
  timezone: "UTC +05:30 · IST",
  engagement: "Project / retainer",
};
