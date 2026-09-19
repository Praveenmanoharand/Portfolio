/*
  Praveen — full-stack developer portfolio.
  Design language: "Signal / System" — editorial brutalism, Swiss hierarchy,
  ink + cream surfaces, Signal Lime as the only interaction colour.

  Motion architecture
   - HeroStage: a 300vh scroll track with a pinned 100svh viewport. Scroll
     progress drives a canvas frame sequence (sprite sheet if available, a
     procedural cinematic renderer as fallback) plus scroll-linked type.
   - useSiteMotion: one effect owning reveal/mask/stagger observers, magnetic
     buttons, the desktop cursor, media parallax and card pointer-glow.
   - Everything is transform/opacity only, and the whole system stands down
     under prefers-reduced-motion.
*/
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { ArrowDownRight, ArrowUpRight, Check, Download, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

/* ── assets ──────────────────────────────────────────────────── */

const MARK_IMAGE = "/manus-storage/praveen-professional-mark_c2c5b279.png";
const FRAME_SPRITE = "/manus-storage/praveen-scroll-sprite_77660a85.jpg";
const AURA_SHOT = "/manus-storage/aura-ai_11e2eeb8.webp";
const PROPOSE_SHOT = "/manus-storage/proposeai_7fe6f63d.webp";
const PRAVIN_PORTRAIT = "/manus-storage/pravin.png";

const SPRITE_FRAMES = 300;
const SPRITE_COLUMNS = 20;
const SPRITE_FRAME_W = 400;
const SPRITE_FRAME_H = 225;
/* Procedural fallback runs at the same frame count so the readout is stable. */
const FRAME_COUNT = SPRITE_FRAMES;

const GITHUB_USER = "Praveenmanoharand";
const EMAIL = "praveenmanoharan.dev@gmail.com";

const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Split a string into per-character spans for animation. */
function splitChars(text: string, startDelay = 0) {
  return text.split("").map((ch, i) => (
    <span
      key={i}
      className="char"
      style={{ "--ci": i, "--cs": startDelay } as CSSProperties}
    >
      {ch === " " ? " " : ch}
    </span>
  ));
}

/* ── procedural frame renderer ───────────────────────────────── */
/*
  Draws a cinematic "signal field": a perspective wireframe terrain whose wave
  phase advances with scroll, a rising horizon bloom, orbital rings and drifting
  motes. Deterministic — frame N always looks identical, so scrubbing backwards
  is stable.
*/
function drawProceduralFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
) {
  const TAU = Math.PI * 2;
  ctx.clearRect(0, 0, w, h);

  // base atmosphere
  const base = ctx.createRadialGradient(
    w * 0.66,
    h * 0.38,
    0,
    w * 0.66,
    h * 0.38,
    Math.max(w, h) * 0.85,
  );
  base.addColorStop(0, "#1c1f19");
  base.addColorStop(0.42, "#121311");
  base.addColorStop(1, "#080907");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.47;
  const cx = w * 0.5;
  const bloomX = w * 0.68;
  const bloomY = horizon - h * 0.06 - t * h * 0.05;

  // horizon bloom — the light source the terrain reads against
  const bloomR = Math.max(w, h) * (0.16 + t * 0.1);
  const bloom = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, bloomR);
  bloom.addColorStop(0, `rgba(199,243,107,${0.3 + t * 0.16})`);
  bloom.addColorStop(0.34, "rgba(199,243,107,0.075)");
  bloom.addColorStop(1, "rgba(199,243,107,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  // cool counter-light so the palette never goes flat
  const cool = ctx.createRadialGradient(
    w * 0.14,
    h * 0.82,
    0,
    w * 0.14,
    h * 0.82,
    Math.max(w, h) * 0.55,
  );
  cool.addColorStop(0, `rgba(64,119,255,${0.16 + t * 0.06})`);
  cool.addColorStop(1, "rgba(64,119,255,0)");
  ctx.fillStyle = cool;
  ctx.fillRect(0, 0, w, h);

  // perspective wireframe terrain
  const rows = 24;
  const cols = 28;
  const grid: Array<Array<[number, number]>> = [];
  for (let j = 0; j <= rows; j++) {
    const d = j / rows;
    const py = horizon + (h - horizon) * Math.pow(d, 2.15);
    const spread = 0.4 + d * 2.5;
    const row: Array<[number, number]> = [];
    for (let i = 0; i <= cols; i++) {
      const u = i / cols - 0.5;
      const px = cx + u * w * spread;
      const wave =
        Math.sin(u * 7.6 + t * TAU * 2 + d * 5.4) * (9 + d * 44) +
        Math.sin(u * 15.2 - t * TAU * 1.35 + d * 2.1) * (3 + d * 15);
      row.push([px, py - wave * (0.4 + t * 0.85) * (1 - d * 0.22)]);
    }
    grid.push(row);
  }

  ctx.lineWidth = 1;
  for (let j = 0; j <= rows; j++) {
    const d = j / rows;
    ctx.beginPath();
    for (let i = 0; i <= cols; i++) {
      const [px, py] = grid[j][i];
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(199,243,107,${0.025 + d * 0.17})`;
    ctx.stroke();
  }
  for (let i = 0; i <= cols; i += 1) {
    ctx.beginPath();
    for (let j = 0; j <= rows; j++) {
      const [px, py] = grid[j][i];
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(244,241,233,${0.02 + (i % 4 === 0 ? 0.045 : 0.012)})`;
    ctx.stroke();
  }

  // orbital rings around the bloom
  for (let k = 0; k < 3; k++) {
    const r = Math.min(w, h) * (0.15 + k * 0.085) * (1 + t * 0.22);
    const rot = t * TAU * (0.35 + k * 0.16) + k * 0.7;
    ctx.save();
    ctx.translate(bloomX, bloomY);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * (0.3 + k * 0.06), 0, 0, TAU);
    ctx.strokeStyle = k === 1 ? "rgba(255,100,77,0.28)" : "rgba(199,243,107,0.24)";
    ctx.lineWidth = k === 1 ? 1.4 : 1;
    ctx.stroke();
    ctx.restore();
  }

  // core
  ctx.beginPath();
  ctx.arc(bloomX, bloomY, Math.max(2, Math.min(w, h) * 0.006), 0, TAU);
  ctx.fillStyle = "rgba(217,255,138,0.9)";
  ctx.fill();

  // drifting motes — deterministic pseudo-random placement
  for (let n = 0; n < 46; n++) {
    const seed = n * 12.9898;
    const rx = Math.abs(Math.sin(seed) * 43758.5453) % 1;
    const ry = Math.abs(Math.sin(seed * 1.7) * 12543.213) % 1;
    const speed = 0.25 + (Math.abs(Math.sin(seed * 2.3)) % 1) * 0.9;
    const px = ((rx + t * speed * 0.14) % 1) * w;
    const py = ((ry + t * speed * 0.3) % 1) * h;
    const size = 0.6 + (Math.abs(Math.sin(seed * 3.1)) % 1) * 1.5;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, TAU);
    ctx.fillStyle = `rgba(244,241,233,${0.07 + (Math.abs(Math.sin(seed * 4.4)) % 1) * 0.16})`;
    ctx.fill();
  }

  // vignette
  const vig = ctx.createRadialGradient(
    cx,
    h * 0.5,
    Math.min(w, h) * 0.28,
    cx,
    h * 0.5,
    Math.max(w, h) * 0.78,
  );
  vig.addColorStop(0, "rgba(8,9,7,0)");
  vig.addColorStop(1, "rgba(8,9,7,0.72)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/* ── hero stage ──────────────────────────────────────────────── */

function HeroStage({ onProgress }: { onProgress?: (p: number) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  const spriteRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(-1);
  const lastSizeRef = useRef("");
  const reducedRef = useRef(false);

  const [mode, setMode] = useState<"procedural" | "sprite">("procedural");
  const modeRef = useRef(mode);
  modeRef.current = mode;

  /* Paint one frame. Cheap-exits when neither frame index nor size changed. */
  const renderFrame = useCallback((frameIndex: number, force = false) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.max(1, Math.floor(cssW * dpr));
    const bh = Math.max(1, Math.floor(cssH * dpr));
    const sizeKey = `${bw}x${bh}`;
    const resized = sizeKey !== lastSizeRef.current;
    if (resized) {
      canvas.width = bw;
      canvas.height = bh;
      lastSizeRef.current = sizeKey;
    }

    const frame = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));
    if (!force && !resized && frame === lastFrameRef.current) return;
    lastFrameRef.current = frame;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sprite = spriteRef.current;
    if (modeRef.current === "sprite" && sprite?.complete && sprite.naturalWidth) {
      const sx = (frame % SPRITE_COLUMNS) * SPRITE_FRAME_W;
      const sy = Math.floor(frame / SPRITE_COLUMNS) * SPRITE_FRAME_H;
      const scale = Math.max(cssW / SPRITE_FRAME_W, cssH / SPRITE_FRAME_H);
      const dw = SPRITE_FRAME_W * scale;
      const dh = SPRITE_FRAME_H * scale;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.drawImage(
        sprite,
        sx,
        sy,
        SPRITE_FRAME_W,
        SPRITE_FRAME_H,
        (cssW - dw) / 2,
        (cssH - dh) / 2,
        dw,
        dh,
      );
    } else {
      drawProceduralFrame(ctx, cssW, cssH, frame / (FRAME_COUNT - 1));
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const label = String(frame + 1).padStart(3, "0");
    if (readoutRef.current) readoutRef.current.textContent = `${label} / ${FRAME_COUNT}`;
    /* Announce sparsely — a live region per frame would flood a screen reader. */
    if (liveRef.current && frame % 30 === 0) {
      liveRef.current.textContent = `Hero sequence ${Math.round(
        (frame / (FRAME_COUNT - 1)) * 100,
      )} percent`;
    }
  }, []);

  /* No scroll-linked animation: hero is a single-screen stage. */
  const update = useCallback(() => {
    rafRef.current = null;
    renderFrame(0, true);
    if (barRef.current) barRef.current.style.width = "0%";
  }, [renderFrame]);

  const schedule = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    reducedRef.current = prefersReducedMotion();

    // Portrait is the only backdrop — no sprite, no scroll mapping.
    renderFrame(0, true);
    schedule();

    const onResize = () => {
      lastSizeRef.current = "";
      renderFrame(0, true);
      schedule();
    };
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      reducedRef.current = motionQuery.matches;
      schedule();
    };

    window.addEventListener("resize", onResize, { passive: true });
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onMotionChange);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      spriteRef.current = null;
    };
  }, [renderFrame, schedule]);

  return (
    <section
      className="hero-stage"
      ref={stageRef}
      aria-labelledby="hero-title"
      data-frame-source={mode}
    >
      <div className="hero-viewport" ref={viewportRef}>
        <canvas className="hero-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-bg-orb hero-bg-orb-1" />
          <div className="hero-bg-orb hero-bg-orb-2" />
          <div className="hero-bg-orb hero-bg-orb-3" />
          <div className="hero-bg-stars">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="hero-bg-star"
                style={cssVars({ "--si": i })}
              />
            ))}
          </div>
          <div className="hero-bg-scan" />
        </div>
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-rule-grid" aria-hidden="true" />

        <div className="hero-body" ref={bodyRef}>
          <motion.div
            className="max-frame hero-copy"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="hero-kicker eyebrow">
              <span className="hero-kicker-tag">P/</span>
              <span className="hero-kicker-line">Praveen — full-stack developer</span>
              <span className="hero-kicker-meta">India · remote worldwide</span>
            </p>
            <h1 className="hero-title" id="hero-title">
              <span className="char-mask" style={cssVars({ "--cs": 0 })}>
                {splitChars("Praveen", 0)}
              </span>
              <span className="char-mask" style={cssVars({ "--cs": 1 })}>
                {splitChars("designs &", 1)}
              </span>
              <span className="char-mask" style={cssVars({ "--cs": 2 })}>
                <span className="hero-accent">{splitChars("ships", 2)}</span>
              </span>
              <span className="char-mask" style={cssVars({ "--cs": 3 })}>
                {splitChars("full-stack products.", 3)}
              </span>
            </h1>
            <p className="hero-note">
              Architecture, interface, and the services behind it — built so a
              product still makes sense at version ten.
            </p>
          </motion.div>

          <div className="hero-actions" data-magnetic-row>
            <a className="signal-button" href="#contact" data-magnetic>
              Start a project
              <span className="button-arrow">
                <ArrowUpRight size={15} />
              </span>
            </a>
            <a className="signal-button signal-button-ghost" href="#projects" data-magnetic>
              See selected work
              <span className="button-arrow">
                <ArrowDownRight size={15} />
              </span>
            </a>
            <a className="signal-button signal-button-ghost" href="#contact" data-magnetic>
              Say hello
              <span className="button-arrow">
                <ArrowUpRight size={15} />
              </span>
            </a>
          </div>
        </div>

        {/* Marquee strip — animated text running across the bottom of the hero */}
        <div className="hero-marquee" aria-hidden="true">
          <div className="hero-marquee-track">
            {Array.from({ length: 2 }).map((_, dup) => (
              <span className="hero-marquee-row" key={dup}>
                {[
                  "Architecture",
                  "·",
                  "Interface",
                  "·",
                  "Backend services",
                  "·",
                  "Design systems",
                  "·",
                  "TypeScript",
                  "·",
                  "React",
                  "·",
                  "Node",
                  "·",
                  "Postgres",
                  "·",
                  "Now shipping from India",
                  "·",
                ].map((word, i) => (
                  <span
                    className={`hero-marquee-word ${word === "·" ? "is-sep" : ""}`}
                    key={`${dup}-${i}`}
                  >
                    {word}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <span className="hero-stage-progress" ref={barRef} aria-hidden="true" />
      </div>
      <span className="sr-only" role="status" aria-live="polite" ref={liveRef} />
    </section>
  );
}

/* ── content ─────────────────────────────────────────────────── */

const services = [
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

const projects = [
  {
    index: "01",
    name: "ProposeAI",
    tag: "Full-stack / live",
    context: "Product build",
    title: "Turn a brief into a proposal.",
    description:
      "An AI-assisted proposal workspace: prompt-driven generation, saved history, rendered preview, and PDF export for delivery.",
    href: "https://proposal-ai-inky.vercel.app/",
    image: PROPOSE_SHOT,
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
    image: AURA_SHOT,
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
    href: "#top",
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

const experiments = [
  {
    number: "01",
    category: "backend",
    label: "Backend",
    title: "Aura AI secure gateway",
    stack: "Auth · Session flows",
    href: "https://chatbot-ai-one-green.vercel.app/",
    image: AURA_SHOT,
    copy: "A focused authentication gateway with login, registration, password recovery, and persistent account access.",
  },
  {
    number: "02",
    category: "full-stack",
    label: "Full-stack",
    title: "ProposeAI proposal engine",
    stack: "AI · Dashboard · PDF",
    href: "https://proposal-ai-inky.vercel.app/",
    image: PROPOSE_SHOT,
    copy: "An AI-assisted proposal workspace with prompt-driven generation, history, rendered previews, and PDF export.",
  },
  {
    number: "03",
    category: "full-stack",
    label: "Full-stack",
    title: "Team launch workspace",
    stack: "React · Node.js",
    image: "",
    copy: "A collaborative workspace connecting a calm interface to workflows, permissions, and persistent project data.",
  },
  {
    number: "04",
    category: "frontend",
    label: "Frontend",
    title: "Design system playground",
    stack: "React · Storybook",
    image: "",
    copy: "A component lab for testing reusable patterns, responsive states, and the accessible details that get skipped.",
  },
  {
    number: "05",
    category: "backend",
    label: "Backend",
    title: "Event ingestion service",
    stack: "Node.js · Redis",
    image: "",
    copy: "A small pipeline for receiving, validating, and routing product activity to whatever needs to hear about it.",
  },
  {
    number: "06",
    category: "full-stack",
    label: "Full-stack",
    title: "Client portal rebuild",
    stack: "React · Express",
    image: "",
    copy: "One portal flow covering onboarding, records, and account actions instead of three disconnected screens.",
  },
];

const experimentFilters = ["All", "Frontend", "Backend", "Full-stack"];

const nowItems = [
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

const beyondItems = [
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

const principles = [
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

const railSections: Array<[string, string]> = [
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

/* ── site-wide motion ────────────────────────────────────────── */

function useSiteMotion() {
  useEffect(() => {
    const reduced = prefersReducedMotion();

    /* 1. Reveal / mask / stagger observers */
    const targets = document.querySelectorAll<HTMLElement>(
      ".reveal, .line-mask, .stagger",
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    if (reduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
    } else {
      targets.forEach((el) => revealObserver.observe(el));
    }

    if (reduced) {
      return () => revealObserver.disconnect();
    }

    const cleanups: Array<() => void> = [() => revealObserver.disconnect()];
    const fine = window.matchMedia("(pointer: fine)").matches;

    /* 2. Magnetic buttons */
    const magnets = document.querySelectorAll<HTMLElement>("[data-magnetic]");
    magnets.forEach((el) => {
      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.setProperty("--mx", `${Math.max(-10, Math.min(10, dx * 0.16))}px`);
        el.style.setProperty("--my", `${Math.max(-8, Math.min(8, dy * 0.22))}px`);
      };
      const onLeave = () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("blur", onLeave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("blur", onLeave);
      });
    });

    /* 3. Pointer-tracked glow on principle cards */
    document.querySelectorAll<HTMLElement>(".principle-card").forEach((card) => {
      const onMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--gx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--gy", `${event.clientY - rect.top}px`);
      };
      card.addEventListener("pointermove", onMove);
      cleanups.push(() => card.removeEventListener("pointermove", onMove));
    });

    /* 4. Parallax drift on project media */
    const figures = Array.from(
      document.querySelectorAll<HTMLImageElement>(".project-figure img"),
    );
    let parallaxRaf: number | null = null;
    const runParallax = () => {
      parallaxRaf = null;
      const vh = window.innerHeight;
      figures.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const centre = rect.top + rect.height / 2;
        const offset = (centre - vh / 2) / vh; // -0.5 .. 0.5-ish
        img.style.setProperty("--py", `${Math.max(-26, Math.min(26, offset * -34))}px`);
      });
    };
    const onParallaxScroll = () => {
      if (parallaxRaf === null) parallaxRaf = window.requestAnimationFrame(runParallax);
    };
    if (figures.length) {
      window.addEventListener("scroll", onParallaxScroll, { passive: true });
      window.addEventListener("resize", onParallaxScroll, { passive: true });
      runParallax();
      cleanups.push(() => {
        window.removeEventListener("scroll", onParallaxScroll);
        window.removeEventListener("resize", onParallaxScroll);
        if (parallaxRaf !== null) window.cancelAnimationFrame(parallaxRaf);
      });
    }

    /* 5. Desktop cursor — a dot that tracks exactly and a ring that lags */
    if (fine) {
      const dot = document.createElement("div");
      const ring = document.createElement("div");
      dot.className = "cursor-dot";
      ring.className = "cursor-ring";
      dot.setAttribute("aria-hidden", "true");
      ring.setAttribute("aria-hidden", "true");
      document.body.append(dot, ring);

      let px = window.innerWidth / 2;
      let py = window.innerHeight / 2;
      let rx = px;
      let ry = py;
      let cursorRaf: number | null = null;
      let active = false;

      const tick = () => {
        rx += (px - rx) * 0.16;
        ry += (py - ry) * 0.16;
        dot.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        cursorRaf = window.requestAnimationFrame(tick);
      };
      cursorRaf = window.requestAnimationFrame(tick);

      const interactive = "a, button, input, textarea, [data-magnetic], .service-row, .experiment-tile";
      const onMove = (event: PointerEvent) => {
        px = event.clientX;
        py = event.clientY;
        if (!active) {
          active = true;
          document.body.classList.add("cursor-active");
        }
        const hovering = (event.target as Element | null)?.closest?.(interactive);
        document.body.classList.toggle("cursor-hover", Boolean(hovering));
      };
      const onOut = () => {
        active = false;
        document.body.classList.remove("cursor-active", "cursor-hover");
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onOut);
      window.addEventListener("blur", onOut);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onOut);
        window.removeEventListener("blur", onOut);
        if (cursorRaf !== null) window.cancelAnimationFrame(cursorRaf);
        dot.remove();
        ring.remove();
        document.body.classList.remove("cursor-active", "cursor-hover");
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
}

/* ── page ────────────────────────────────────────────────────── */

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [markOk, setMarkOk] = useState(true);
  const [experimentFilter, setExperimentFilter] = useState("All");
  const [github, setGithub] = useState<Array<[string, string]>>([
    ["Public repos", "—"],
    ["Languages", "—"],
    ["Stars earned", "—"],
    ["Last push", "—"],
  ]);

  const filteredExperiments = experiments.filter(
    (experiment) =>
      experimentFilter === "All" ||
      experiment.category === experimentFilter.toLowerCase(),
  );

  useSiteMotion();

  /* Stat number counter — animates from 0 to target when visible */
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>(".about-stat-num");
    if (!counters.length) return;

    const animateCounter = (el: HTMLElement) => {
      const target = parseInt(el.dataset.target || "0", 10);
      if (!target) return;
      let start: number | null = null;
      const duration = 1200;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(eased * target)).padStart(2, "0");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target as HTMLElement);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  /* nav state + rail active section */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }),
      { threshold: 0, rootMargin: "-20% 0px -60% 0px" },
    );
    railSections.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* re-reveal rows after a filter change — add is-visible immediately */
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document
        .querySelectorAll<HTMLElement>(".experiment-row")
        .forEach((row) => row.classList.add("is-visible"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [experimentFilter]);

  /* live GitHub numbers — honest dashes if the request fails */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
        );
        if (!response.ok) return;
        const repos = (await response.json()) as Array<{
          language?: string | null;
          stargazers_count?: number;
          pushed_at?: string;
        }>;
        if (cancelled || !Array.isArray(repos) || !repos.length) return;
        const languages = new Set(repos.map((r) => r.language).filter(Boolean));
        const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        const pushed = repos[0]?.pushed_at ? new Date(repos[0].pushed_at) : null;
        const lastPush = pushed
          ? `${String(pushed.getMonth() + 1).padStart(2, "0")}/${String(
            pushed.getFullYear(),
          ).slice(-2)}`
          : "—";
        setGithub([
          ["Public repos", String(repos.length)],
          ["Languages", String(languages.size)],
          ["Stars earned", String(stars)],
          ["Last push", lastPush],
        ]);
      } catch {
        /* offline or rate-limited — leave the dashes */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleResumeDownload = () => {
    const resume = [
      "PRAVEEN",
      "FULL-STACK DEVELOPER — India / remote worldwide",
      "",
      "I design the structure, build the interface, and stand up the services behind it.",
      "",
      "FOCUS",
      "Product architecture",
      "Interface engineering",
      "Full-stack delivery",
      "Design systems",
      "Technical direction",
      "",
      "LIVE WORK",
      "ProposeAI — AI-assisted proposal workspace — https://proposal-ai-inky.vercel.app/",
      "Aura AI — authentication gateway — https://chatbot-ai-one-green.vercel.app/",
      "",
      "CONTACT",
      EMAIL,
      `github.com/${GITHUB_USER}`,
      "",
    ].join("\n");
    const blob = new Blob([resume], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "praveen-full-stack-profile.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const brandMark = markOk ? (
    <img src={MARK_IMAGE} alt="" onError={() => setMarkOk(false)} />
  ) : (
    "P/"
  );

  return (
    <div className="page-shell">
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <header className={scrolled ? "site-nav is-scrolled" : "site-nav"}>
        <span className="site-nav-scan" aria-hidden="true" />
        <div className="max-frame nav-inner">
          <a
            className="brand-lockup"
            href="#top"
            aria-label="Praveen — back to top"
            onClick={closeMenu}
          >
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-glow" />
              {brandMark}
            </span>
            <span className="brand-wordmark">
              <span className="brand-wordmark-name">Praveen</span>
              <span className="brand-wordmark-sep" aria-hidden="true">
                <span className="brand-wordmark-dot" />
              </span>
              <span className="brand-wordmark-role">full-stack developer</span>
            </span>
          </a>

          <nav
            className={menuOpen ? "nav-links is-open" : "nav-links"}
            aria-label="Primary"
          >
            {[
              { id: "about", label: "About", num: "01" },
              { id: "services", label: "Services", num: "02" },
              { id: "projects", label: "Projects", num: "03" },
              { id: "experiments", label: "Experiments", num: "04" },
              { id: "contact", label: "Contact", num: "05" },
            ].map(({ id, label, num }) => {
              const isCurrent = activeSection === id;
              return (
                <a
                  className={
                    isCurrent ? "nav-link is-current" : "nav-link"
                  }
                  href={`#${id}`}
                  key={id}
                  onClick={closeMenu}
                  aria-current={isCurrent ? "true" : undefined}
                  data-magnetic
                >
                  <span className="nav-link-num" aria-hidden="true">
                    {num}
                  </span>
                  <span className="nav-link-label">{label}</span>
                  {isCurrent && (
                    <span className="nav-link-active-dot" aria-hidden="true" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="nav-meta">
            <p className="nav-status">
              <span className="status-dot" aria-hidden="true" />
              <span className="nav-status-text">Available</span>
              <span className="nav-status-sep" aria-hidden="true">
                ·
              </span>
              <span className="nav-status-time">Q4 2026</span>
            </p>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>
              <span>Start</span>
              <ArrowUpRight size={13} aria-hidden="true" />
              <span className="nav-cta-shine" />
            </a>
          </div>

          <button
            className="mobile-menu"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <>
                <X size={15} /> Close
              </>
            ) : (
              <>
                <Menu size={15} /> Menu
              </>
            )}
          </button>
        </div>
        <span
          className="nav-progress"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />
      </header>

      <aside className="section-rail" aria-label="Section index">
        <div className="rail-top">
          <span>P/</span>
          <span>Index</span>
        </div>
        <div className="rail-track">
          <span className="rail-progress" style={{ height: `${scrollProgress}%` }} />
        </div>
        <div className="rail-links">
          {railSections.map(([id, label], index) => (
            <a
              className={activeSection === id ? "rail-link is-active" : "rail-link"}
              href={`#${id}`}
              key={id}
              aria-label={`Go to ${label}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{label}</b>
            </a>
          ))}
        </div>
      </aside>

      <main id="top">
        <HeroStage />

        {/* ── about ── */}
        <section className="section-dark section-noise about" id="about" aria-labelledby="about-title">
          <div className="about-bg" aria-hidden="true">
            <div className="about-bg-glow about-bg-glow-1" />
            <div className="about-bg-glow about-bg-glow-2" />
            <div className="about-bg-grid" />
            <div className="about-bg-particles">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="about-bg-particle" style={cssVars({ "--pi": i })} />
              ))}
            </div>
          </div>

          <div className="max-frame">
            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> About me
              </span>
              <span className="index">02 / 12</span>
            </div>

            <div className="about-layout">
              <figure className="about-portrait reveal" data-tilt>
                <span className="about-portrait-aurora" aria-hidden="true" />
                <span className="about-portrait-ring about-portrait-ring-1" aria-hidden="true">
                  <svg viewBox="0 0 200 200" aria-hidden="true">
                    <defs>
                      <path id="ringPath1" d="M 100,100 m -90,0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0" />
                    </defs>
                    <text fontSize="10" fontFamily="IBM Plex Mono, monospace" letterSpacing="3" fill="rgba(199, 243, 107, 0.55)">
                      <textPath href="#ringPath1">FULL-STACK · PRODUCT · INDIA · REMOTE · SHIPPING · 2026 · </textPath>
                    </text>
                  </svg>
                </span>
                <span className="about-portrait-ring about-portrait-ring-2" aria-hidden="true">
                  <svg viewBox="0 0 200 200" aria-hidden="true">
                    <defs>
                      <path id="ringPath2" d="M 100,100 m -90,0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0" />
                    </defs>
                    <text fontSize="9" fontFamily="IBM Plex Mono, monospace" letterSpacing="6" fill="rgba(232, 80, 26, 0.55)">
                      <textPath href="#ringPath2">P · P · P · P · P · P · P · P · P · P · P · P · </textPath>
                    </text>
                  </svg>
                </span>

                <span className="about-portrait-frame" aria-hidden="true" />
                <span className="about-portrait-corners" aria-hidden="true">
                  <i /><i /><i /><i />
                </span>
                <span className="about-portrait-tag">P/</span>
                <span className="about-portrait-status" aria-hidden="true">
                  <span className="about-portrait-status-dot" />
                  Live signal
                </span>
                <span className="about-portrait-meta" aria-hidden="true">
                  <span>Praveen</span>
                  <span>Tamil Nadu, IN</span>
                </span>
                <span className="about-portrait-coord" aria-hidden="true">
                  <span>10.79°N</span>
                  <span>78.70°E</span>
                </span>
                <img src={PRAVIN_PORTRAIT} alt="Portrait of Praveen" loading="lazy" />
                <span className="about-portrait-grid" aria-hidden="true" />
                <span className="about-portrait-scan" aria-hidden="true" />
                <span className="about-portrait-vignette" aria-hidden="true" />
                <span className="about-portrait-glow" aria-hidden="true" />
              </figure>

              <div className="about-copy">
                <h2 className="display display-lg" id="about-title">
                  <span className="line-mask">
                    <span style={cssVars({ "--i": 0 })}>About</span>
                  </span>
                  <span className="line-mask">
                    <span className="outline-type" style={cssVars({ "--i": 1 })}>
                      me
                    </span>
                  </span>
                </h2>

                <p className="about-lead reveal">
                  I&apos;m a full-stack developer who spends most of his time{" "}
                  <em>turning vague ideas into things people can actually use.</em>
                </p>

                <div className="about-body reveal reveal-delay-1">
                  <p>
                    That usually means starting further back than the screen — what
                    the data really looks like, which states exist, and where the
                    thing will break under load. The interface gets easier once that
                    is settled.
                  </p>
                  <p>
                    I like small teams and short feedback loops, work that has a real
                    user on the other end, and shipping something modest that holds up
                    rather than something ambitious that doesn&apos;t.
                  </p>
                </div>

                <div className="about-stack reveal reveal-delay-2">
                  <span className="about-stack-key">In the loop with</span>
                  <ul className="about-stack-list">
                    <li>TypeScript</li>
                    <li>React</li>
                    <li>Node</li>
                    <li>Postgres</li>
                    <li>Tailwind</li>
                    <li>Framer</li>
                    <li>Vite</li>
                    <li>Figma</li>
                  </ul>
                </div>

                <div className="about-aside stagger">
                  <div className="about-stat" data-stat="1">
                    <span className="about-stat-bg" aria-hidden="true" />
                    <strong>
                      <span className="about-stat-num" data-target="02">00</span>
                    </strong>
                    <span className="about-stat-label">Live products</span>
                    <span className="about-stat-tick" aria-hidden="true" />
                  </div>
                  <div className="about-stat" data-stat="2">
                    <span className="about-stat-bg" aria-hidden="true" />
                    <strong>
                      <span className="about-stat-num" data-target="06">00</span>
                    </strong>
                    <span className="about-stat-label">Lab builds</span>
                    <span className="about-stat-tick" aria-hidden="true" />
                  </div>
                  <div className="about-stat" data-stat="3">
                    <span className="about-stat-bg" aria-hidden="true" />
                    <strong>
                      <span className="about-stat-num" data-target="01">00</span>
                    </strong>
                    <span className="about-stat-label">Design system</span>
                    <span className="about-stat-tick" aria-hidden="true" />
                  </div>
                </div>

                <div className="about-stamp" aria-hidden="true">
                  <span>— Praveen / 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── services ── */}
        <section className="section-cream services" id="services" aria-labelledby="services-title">
          <div className="max-frame">
            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> What I do
              </span>
              <span className="index">03 / 12</span>
            </div>
            <div className="services-head">
              <h2 className="display display-lg services-title" id="services-title">
                <span className="line-mask">
                  <span style={cssVars({ "--i": 0 })}>Services</span>
                </span>
              </h2>
              <p className="services-intro reveal">
                Five ways I help get a rough idea to something people can navigate,
                trust, and keep using.
              </p>
            </div>
            <div className="services-list">
              {services.map(([number, name, description], index) => (
                <div
                  className={`service-row reveal reveal-delay-${Math.min(index + 1, 3)}`}
                  key={number}
                >
                  <span className="service-number">{number}</span>
                  <h3 className="service-name">{name}</h3>
                  <p className="service-description">{description}</p>
                  <ArrowDownRight className="service-arrow" size={19} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── projects ── */}
        <section className="section-dark projects" id="projects" aria-labelledby="projects-title">
          <div className="max-frame">
            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> Selected projects
              </span>
              <span className="index">04 / 12</span>
            </div>
            <div className="projects-header">
              <h2 className="display display-lg" id="projects-title">
                <span className="line-mask">
                  <span style={cssVars({ "--i": 0 })}>Projects</span>
                </span>
              </h2>
              <p className="projects-blurb reveal">
                Two products running in the wild and the system this page is built on.
                Each one shipped end to end.
              </p>
            </div>
            <div className="project-stack">
              {projects.map((project) => {
                const external = project.href.startsWith("http");
                return (
                  <article
                    className={`project-card project-${project.accent} reveal`}
                    key={project.index}
                  >
                    <div className="project-top">
                      <span className="project-index">{project.index}</span>
                      <div className="project-client-block">
                        <span className="project-label">Project</span>
                        <span className="project-client">{project.name}</span>
                      </div>
                      <span className="project-tag">{project.tag}</span>
                      <a
                        className="project-link"
                        href={project.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                      >
                        {external ? "Open live" : "You're in it"}
                        <span className="link-arrow" aria-hidden="true">
                          <ArrowUpRight size={13} />
                        </span>
                      </a>
                    </div>

                    <div className="project-media">
                      <figure
                        className={
                          project.image ? "project-figure" : "project-figure is-fallback"
                        }
                      >
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={`${project.name} interface`}
                            loading="lazy"
                            onError={(event) =>
                              event.currentTarget.parentElement?.classList.add(
                                "is-fallback",
                              )
                            }
                          />
                        ) : null}
                        <figcaption className="project-figure-tag">
                          {project.figureTag}
                        </figcaption>
                      </figure>

                      <div className="project-copy-block">
                        <span className="project-context">P/ {project.context}</span>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="project-evidence">
                          {project.evidence.map(([key, value]) => (
                            <span key={key}>
                              <b>{key}</b>
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="project-chip">
                        <span className="chip-dot" aria-hidden="true" /> {project.stack}
                      </p>
                    </div>

                    <p className="project-stack-line">Role / {project.role}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── experiments ── */}
        <section className="section-cream experiments" id="experiments" aria-labelledby="experiments-title">
          <div className="max-frame">

            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> Experiments
              </span>
              <span className="index">05 / 12</span>
            </div>

            {/* Top: editorial headline + filter + intro side by side */}
            <div className="experiments-top">
              <h2 className="experiments-title" id="experiments-title">
                <span className="char-mask" style={cssVars({ "--cs": 0 })}>
                  {splitChars("Experi", 0)}
                </span>
                <span className="char-mask" style={cssVars({ "--cs": 1 })}>
                  <span className="experiments-accent">{splitChars("ments.", 1)}</span>
                </span>
              </h2>
              <div className="experiments-side">
                <p className="experiments-intro reveal">
                  Smaller builds and half-formed ideas. Most taught me something
                  before they became anything.
                </p>
                <div className="experiment-filter" role="group" aria-label="Filter experiments">
                  {experimentFilters.map((filter) => (
                    <button
                      className={
                        experimentFilter === filter
                          ? "experiment-filter-button is-active"
                          : "experiment-filter-button"
                      }
                      type="button"
                      key={filter}
                      onClick={() => setExperimentFilter(filter)}
                      aria-pressed={experimentFilter === filter}
                    >
                      <i aria-hidden="true" />
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Horizontal list — editorial rows with staggered offsets */}
            <div className="experiment-list">
              {filteredExperiments.length === 0 ? (
                <p className="experiment-empty">Nothing in this track yet.</p>
              ) : (
                filteredExperiments.map((experiment, index) => (
                  <article
                    className={`experiment-row reveal exp-row-${(index % 4) + 1}`}
                    key={experiment.number}
                    style={{ transitionDelay: `${(index % 3) * 80 + Math.floor(index / 3) * 40}ms` }}
                  >
                    <a
                      className="experiment-row-link"
                      href={experiment.href || "#contact"}
                      target={experiment.href ? "_blank" : undefined}
                      rel={experiment.href ? "noreferrer" : undefined}
                    >
                      <span className="exp-row-num">{experiment.number}</span>
                      <span className="exp-row-body">
                        <span className="exp-row-meta">
                          <span className="exp-row-cat">{experiment.category}</span>
                          <span className="exp-row-stack">{experiment.stack}</span>
                        </span>
                        <span className="exp-row-title">{experiment.title}</span>
                        <span className="exp-row-copy">{experiment.copy}</span>
                      </span>
                      {experiment.image ? (
                        <span className="exp-row-thumb">
                          <img
                            src={experiment.image}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <span className="exp-row-thumb-label">{experiment.label}</span>
                        </span>
                      ) : (
                        <span className="exp-row-thumb exp-row-thumb-empty">
                          <span className="exp-row-thumb-empty-mark" aria-hidden="true">
                            <i /><i /><i /><i />
                          </span>
                          <span className="exp-row-thumb-label">{experiment.label}</span>
                        </span>
                      )}
                      <span className="exp-row-arrow" aria-hidden="true">
                        <ArrowUpRight size={20} />
                      </span>
                    </a>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── now ── */}
        <section className="section-dark now-section" id="now" aria-labelledby="now-title">
          <div className="max-frame">

            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> Now
              </span>
              <span className="index">06 / 12</span>
            </div>

            {/* Status strip — live ticker above the cards */}
            <div className="now-status" aria-hidden="true">
              <span className="now-status-live">
                <i /> LIVE
              </span>
              <span className="now-status-quote">{nowItems[0][0]} — {nowItems[0][1].split(".")[0]}.</span>
              <span className="now-status-meta">Q3 · 2026</span>
            </div>

            <div className="now-head">
              <h2 className="now-title" id="now-title">
                <span className="char-mask" style={cssVars({ "--cs": 0 })}>
                  {splitChars("Now.", 0)}
                </span>
              </h2>
              <p className="now-intro reveal">
                What is actually on the desk this quarter — updated when it changes,
                not when it sounds good.
              </p>
            </div>

            <div className="now-grid">
              {nowItems.map(([label, copy], index) => (
                <article
                  className={`now-item reveal`}
                  key={label}
                  style={{ transitionDelay: `${(index + 1) * 90}ms` }}
                >
                  <span className="now-bg-num" aria-hidden="true">0{index + 1}</span>
                  <span className="now-corner tl" aria-hidden="true" />
                  <span className="now-corner tr" aria-hidden="true" />
                  <span className="now-corner bl" aria-hidden="true" />
                  <span className="now-corner br" aria-hidden="true" />

                  <div className="now-item-head">
                    <span className="now-item-tag">
                      <i className="now-item-pulse" />
                      STATUS
                    </span>
                    <span className="now-no">0{index + 1}</span>
                  </div>

                  <h3>{label}</h3>
                  <p>{copy}</p>

                  <div className="now-item-bar" aria-hidden="true">
                    <span className="now-item-bar-fill" />
                  </div>

                  <span className="now-item-cta" aria-hidden="true">
                    Read note
                    <ArrowUpRight size={11} />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── beyond code ── */}
        <section className="section-dark beyond-code" id="beyond-code" aria-labelledby="beyond-code-title">
          <div className="max-frame">
            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> Beyond code
              </span>
              <span className="index">07 / 12</span>
            </div>

            <div className="beyond-head">
              <h2 className="display display-lg beyond-title" id="beyond-code-title">
                <span className="line-mask">
                  <span style={cssVars({ "--i": 0 })}>Beyond</span>
                </span>
                <span className="line-mask">
                  <span style={cssVars({ "--i": 1 })}>
                    <span>code.</span>
                  </span>
                </span>
              </h2>
              <p className="beyond-intro reveal">
                The visual habits that feed the software — motion, type, colour, and
                looking at buildings for too long.
              </p>
            </div>

            {/* Counter strip — animated numbers running across */}
            <div className="beyond-counter" aria-hidden="true">
              <div className="beyond-counter-track">
                {Array.from({ length: 2 }).map((_, dup) => (
                  <span className="beyond-counter-row" key={dup}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span className="beyond-counter-cell" key={`${dup}-${i}`}>
                        <b>{String(i + 1).padStart(2, "0")}</b>
                        <i />
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>

            <div className="beyond-gallery">
              {beyondItems.map(([number, label, title, copy], index) => (
                <article
                  className={`beyond-item beyond-item-${index + 1} reveal`}
                  key={number}
                  data-tilt
                >
                  <span className="beyond-border" aria-hidden="true" />
                  <span className="beyond-corner tl" aria-hidden="true" />
                  <span className="beyond-corner tr" aria-hidden="true" />
                  <span className="beyond-corner bl" aria-hidden="true" />
                  <span className="beyond-corner br" aria-hidden="true" />

                  <div className="beyond-visual">
                    <span className="beyond-visual-num" data-text={number}>
                      {number}
                    </span>
                    <span className="beyond-visual-label">{label}</span>
                    <span className="beyond-visual-ornament" aria-hidden="true" />
                    <span className="beyond-visual-particles" aria-hidden="true">
                      {Array.from({ length: 6 }).map((_, p) => (
                        <i key={p} style={{ "--p": p } as CSSProperties} />
                      ))}
                    </span>
                  </div>

                  <div className="beyond-copy">
                    <span className="beyond-tag">/{title}</span>
                    <p>{copy}</p>
                    <span className="beyond-cta" aria-hidden="true">
                      Read on
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── github ── */}
        <section className="section-dark github-activity" id="github-activity" aria-labelledby="github-title">
          <div className="max-frame">

            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> GitHub / activity
              </span>
              <span className="index">08 / 12</span>
            </div>

            <div className="github-layout">
              {/* Left — headline + copy */}
              <div className="github-left">
                <h2 className="github-title" id="github-title">
                  <span className="char-mask" style={cssVars({ "--cs": 0 })}>
                    {splitChars("Built.", 0)}
                  </span>
                  <span className="char-mask" style={cssVars({ "--cs": 1 })}>
                    {splitChars("Committed.", 1)}
                  </span>
                  <span className="char-mask" style={cssVars({ "--cs": 2 })}>
                    <span className="github-accent">{splitChars("Shipped.", 2)}</span>
                  </span>
                </h2>
                <p className="github-copy reveal">
                  Numbers pulled live from the GitHub API — public repos, primary
                  language, total stars, and the last time anything shipped. If you
                  see a dash, the API rate-limited the request.
                </p>
                <div className="github-actions">
                  <a
                    className="signal-button"
                    href={`https://github.com/${GITHUB_USER}`}
                    target="_blank"
                    rel="noreferrer"
                    data-magnetic
                  >
                    Explore GitHub
                    <span className="button-arrow">
                      <ArrowUpRight size={15} />
                    </span>
                  </a>
                  <span className="github-handle">
                    <span>@</span>{GITHUB_USER}
                  </span>
                </div>
              </div>

              {/* Right — stat cards */}
              <div className="github-right">
                <div className="github-stats">
                  {github.map(([label, value], index) => (
                    <div className="github-stat reveal" key={label} data-index={index}>
                      <span className="github-stat-num" data-target={value} data-index={index}>
                        {value}
                      </span>
                      <span className="github-stat-label">{label}</span>
                      <span
                        className="github-stat-ornament"
                        style={{ "--idx": index } as CSSProperties}
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>

                {/* Contribution heatmap strip */}
                <div className="github-heatmap reveal reveal-delay-2">
                  <span className="github-heatmap-label">Contribution activity</span>
                  <div className="github-heatmap-grid" aria-hidden="true">
                    {Array.from({ length: 52 * 7 }, (_, i) => {
                      const intensity = Math.random();
                      const level = intensity < 0.2 ? 0 : intensity < 0.4 ? 1 : intensity < 0.6 ? 2 : intensity < 0.8 ? 3 : 4;
                      return (
                        <span
                          key={i}
                          className={`github-cell level-${level}`}
                          style={{ animationDelay: `${(i % 52) * 30}ms` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── principles ── */}
        <section className="section-dark principles" id="principles" aria-labelledby="principles-title">
          <div className="max-frame">
            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> What I care about
              </span>
              <span className="index">09 / 12</span>
            </div>
            <div className="principles-header">
              <h2 className="display display-md principles-title" id="principles-title">
                <span className="line-mask">
                  <span style={cssVars({ "--i": 0 })}>How I</span>
                </span>
                <span className="line-mask">
                  <span style={cssVars({ "--i": 1 })}>
                    <span>work.</span>
                  </span>
                </span>
              </h2>
              <p className="principles-note reveal">
                Not a testimonials wall. Three working rules that shape everything
                above.
              </p>
            </div>
            <div className="principles-grid stagger">
              {principles.map(([number, title, copy]) => (
                <article className="principle-card" key={number}>
                  <span className="principle-no">{number}</span>
                  <div>
                    <h3 className="principle-title">{title}</h3>
                    <p className="principle-copy">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── resume ── */}
        <section className="section-dark resume-section" id="resume" aria-labelledby="resume-title">
          <div className="max-frame">
            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> Resume / profile
              </span>
              <span className="index">10 / 12</span>
            </div>
            <div className="resume-layout">
              <div className="resume-copy reveal">
                <span className="resume-overline">A concise view of the work</span>
                <h2 className="display display-md resume-title" id="resume-title">
                  <span className="line-mask">
                    <span style={cssVars({ "--i": 0 })}>Make the</span>
                  </span>
                  <span className="line-mask">
                    <span style={cssVars({ "--i": 1 })}>
                      <span>next</span> build
                    </span>
                  </span>
                  <span className="line-mask">
                    <span style={cssVars({ "--i": 2 })}>obvious.</span>
                  </span>
                </h2>
                <p className="resume-intro">
                  A short profile of what I build, the tools I reach for, and how I get
                  from first sketch to a release that holds.
                </p>
                <button
                  className="resume-download"
                  type="button"
                  onClick={handleResumeDownload}
                  data-magnetic
                >
                  <span>Download profile</span>
                  <Download size={17} aria-hidden="true" />
                </button>
                <p className="resume-note">
                  TXT profile · instant download · swap for a PDF anytime
                </p>
              </div>
              <div className="resume-sheet-wrap reveal reveal-delay-1">
                <div className="resume-sheet">
                  <div className="resume-sheet-top">
                    <span>Praveen / 2026</span>
                    <span>Profile 01</span>
                  </div>
                  <p className="resume-sheet-name">PRAVEEN</p>
                  <p className="resume-sheet-role">FULL-STACK DEVELOPER</p>
                  <div className="resume-sheet-rule" />
                  <div className="resume-sheet-grid">
                    <div>
                      <span>Builds</span>
                      <b>
                        Products
                        <br />
                        Systems
                        <br />
                        Interfaces
                      </b>
                    </div>
                    <div>
                      <span>Works with</span>
                      <b>
                        React
                        <br />
                        Node
                        <br />
                        Data
                      </b>
                    </div>
                  </div>
                  <div className="resume-sheet-foot">
                    <span className="resume-live-dot" aria-hidden="true" /> Available
                    for select work <span aria-hidden="true">↗</span>
                  </div>
                </div>
                <span className="resume-orbit resume-orbit-a" aria-hidden="true" />
                <span className="resume-orbit resume-orbit-b" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* ── contact ── */}
        <section className="section-cream contact" id="contact" aria-labelledby="contact-title">
          <div className="max-frame">
            <div className="section-bar eyebrow">
              <span className="label">
                <span className="at-annotation">P/</span> Let&apos;s make something
              </span>
              <span className="index">11 / 12</span>
            </div>
            <div className="contact-grid">
              <div>
                <h2 className="display display-lg contact-title" id="contact-title">
                  <span className="line-mask">
                    <span style={cssVars({ "--i": 0 })}>Let&apos;s get</span>
                  </span>
                  <span className="line-mask">
                    <span className="accent" style={cssVars({ "--i": 1 })}>
                      in
                    </span>
                  </span>
                  <span className="line-mask">
                    <span style={cssVars({ "--i": 2 })}>touch.</span>
                  </span>
                </h2>
                <p className="contact-copy reveal">
                  Got something in mind? Tell me what it needs to do and who it&apos;s
                  for. A new product, a sharper interface, or a backend that has to
                  hold up — all fair game.
                </p>
                <a className="contact-email" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
                <span className="contact-prop" aria-hidden="true">
                  ◒
                </span>
              </div>

              <form className="contact-form reveal reveal-delay-1" onSubmit={handleSubmit}>
                <div className="form-intro">
                  <span>Start a project</span>
                  <span>Reply within 2–3 days</span>
                </div>
                <div className="form-fields">
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input id="name" name="name" type="text" placeholder="Your name" required />
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="phone">Phone</label>
                      <input id="phone" name="phone" type="tel" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="What are you trying to build?"
                      required
                    />
                  </div>
                </div>
                <button className="signal-button form-submit" type="submit" data-magnetic>
                  {submitted ? (
                    <>
                      Sent <Check size={16} aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Send <ArrowUpRight size={17} aria-hidden="true" />
                    </>
                  )}
                </button>
                {submitted && (
                  <p className="form-success" role="status">
                    <Check size={14} aria-hidden="true" /> Thanks — I&apos;ll come back
                    to you shortly.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* ── close ── */}
        <section className="section-dark final-cta" id="final-cta" aria-labelledby="final-cta-title">
          {/* Animated background fields */}
          <div className="final-cta-bg" aria-hidden="true">
            <div className="final-cta-glow final-cta-glow-1" />
            <div className="final-cta-glow final-cta-glow-2" />
            <div className="final-cta-grid" />
            <div className="final-cta-scan" />
            <div className="final-cta-stars">
              {Array.from({ length: 36 }).map((_, i) => (
                <span key={i} className="final-cta-star" style={cssVars({ "--si": i })} />
              ))}
            </div>
          </div>

          <div className="max-frame final-cta-frame">
            <div className="final-cta-top eyebrow">
              <span className="final-cta-tag">
                <span className="final-cta-tag-dot" />
                P/ closing signal
              </span>
              <span className="final-cta-counter">12 / 12 · end of scroll</span>
            </div>

            <div className="final-cta-body">
              <div className="final-cta-headline-wrap">
                <p className="final-cta-pre reveal">
                  <span className="final-cta-pre-mark">◐</span>
                  Ready when you are
                </p>
                <h2 className="final-cta-title" id="final-cta-title">
                  <span className="char-mask" style={cssVars({ "--cs": 0 })}>
                    {splitChars("Have", 0)}
                  </span>
                  {" "}
                  <span className="char-mask" style={cssVars({ "--cs": 1 })}>
                    {splitChars("something", 1)}
                  </span>
                  <br />
                  <span className="char-mask" style={cssVars({ "--cs": 2 })}>
                    <span className="final-cta-accent">{splitChars("worth", 2)}</span>
                  </span>
                  {" "}
                  <span className="char-mask" style={cssVars({ "--cs": 3 })}>
                    {splitChars("building?", 3)}
                  </span>
                </h2>
              </div>

              <div className="final-cta-side reveal reveal-delay-1">
                <p className="final-cta-pitch">
                  A short email is enough. Send a sketch, a brief, or a half-formed
                  idea — I&apos;ll come back with a sharp take within 48 hours.
                </p>

                <div className="final-cta-actions">
                  <a className="final-cta-button" href={`mailto:${EMAIL}`} data-magnetic>
                    <span className="final-cta-button-label">
                      Start the signal
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </span>
                    <span className="final-cta-button-pulse" />
                    <span className="final-cta-button-shine" />
                  </a>
                  <a
                    className="final-cta-button final-cta-button-ghost"
                    href="#projects"
                    data-magnetic
                  >
                    <span className="final-cta-button-label">
                      Re-read the work
                      <ArrowDownRight size={16} aria-hidden="true" />
                    </span>
                  </a>
                </div>

                <ul className="final-cta-links">
                  <li>
                    <a href={`mailto:${EMAIL}`} data-magnetic>
                      <span className="final-cta-link-key">Email</span>
                      <span className="final-cta-link-val">{EMAIL}</span>
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://github.com/${GITHUB_USER}`}
                      target="_blank"
                      rel="noreferrer"
                      data-magnetic
                    >
                      <span className="final-cta-link-key">GitHub</span>
                      <span className="final-cta-link-val">@{GITHUB_USER}</span>
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://proposal-ai-inky.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      data-magnetic
                    >
                      <span className="final-cta-link-key">ProposeAI</span>
                      <span className="final-cta-link-val">live · 2026</span>
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="final-cta-meta">
              <div className="final-cta-meta-cell">
                <span className="final-cta-meta-key">Status</span>
                <span className="final-cta-meta-val final-cta-meta-live">
                  <span className="final-cta-meta-dot" />
                  Available for Q4
                </span>
              </div>
              <div className="final-cta-meta-cell">
                <span className="final-cta-meta-key">Reply time</span>
                <span className="final-cta-meta-val">≤ 48 hours</span>
              </div>
              <div className="final-cta-meta-cell">
                <span className="final-cta-meta-key">Time zone</span>
                <span className="final-cta-meta-val">UTC +05:30 · IST</span>
              </div>
              <div className="final-cta-meta-cell">
                <span className="final-cta-meta-key">Engagement</span>
                <span className="final-cta-meta-val">Project / retainer</span>
              </div>
            </div>

            <div className="final-cta-line" />
          </div>
        </section>
      </main>

      <footer className="section-dark site-footer">
        <div className="max-frame">
          <div className="footer-main">
            <div className="footer-signature">
              <div className="footer-mark" aria-hidden="true">
                {markOk ? <img src={MARK_IMAGE} alt="" /> : "P/"}
              </div>
              <p className="footer-name">Praveen</p>
              <span className="footer-role">
                Full-stack developer / product builder
              </span>
            </div>
            <div>
              <h2 className="footer-heading">Live work</h2>
              <ul className="footer-list">
                <li>
                  <a
                    href="https://proposal-ai-inky.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ProposeAI <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://chatbot-ai-one-green.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Aura AI <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href={`https://github.com/${GITHUB_USER}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="footer-heading">Contact</h2>
              <ul className="footer-list">
                <li>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </li>
                <li>India / remote worldwide</li>
                <li>UTC +05:30</li>
              </ul>
            </div>
          </div>
          <div className="shape-strip" aria-hidden="true">
            <span className="shape-cross">×</span>
            <span className="shape-dots">•••</span>
            <span className="shape-blob">●</span>
            <span className="shape-ring">○</span>
            <span className="shape-zig">〰</span>
            <span className="shape-bow">◆</span>
            <span className="shape-triangle">△</span>
            <span className="shape-pink">◎</span>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Praveen / Built with care</span>
            <span>
              <strong>P/</strong> Signal / System
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
