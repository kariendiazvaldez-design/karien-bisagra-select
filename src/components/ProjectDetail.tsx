import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Film, Play } from "lucide-react";

export interface ProjectDetailProps {
  title: string;
  description: string;
  client: string;
  year: string;
  role: string[];
  projectType: string[];
  tools: string[];
  content: string;
  heroImage?: string;
}

const OLIVE = "#6B7A3E";
const BG = "#FAFAF7";
const QUOTE_BG = "#F3F4EE";

const MetaChip = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: 10,
        color: "#999",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 2,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: 13,
        color: OLIVE,
      }}
    >
      {value}
    </span>
  </div>
);

const PlaceholderBlock = ({
  kind,
  label,
}: {
  kind: "IMAGE" | "GIF" | "VIDEO";
  label: string;
}) => {
  const isVideo = kind === "VIDEO";
  const Icon = kind === "VIDEO" ? Play : kind === "GIF" ? Film : ImageIcon;
  return (
    <figure className="my-10 md:my-12 md:-mx-[110px]">
      <div
        className="w-full flex items-center justify-center"
        style={{
          background: "#E8E8E8",
          height: isVideo ? 480 : 400,
        }}
      >
        <Icon size={48} color="#999" strokeWidth={1.5} />
      </div>
      <figcaption
        className="mt-3 text-center"
        style={{ color: "#999", fontFamily: "Lexend, sans-serif", fontSize: 13 }}
      >
        {kind}: {label}
      </figcaption>
    </figure>
  );
};

const ImagePairBlock = ({
  labels,
}: {
  labels: string[];
}) => (
  <figure className="my-10 md:my-12 md:-mx-[110px] grid grid-cols-1 md:grid-cols-2 gap-4">
    {labels.map((label, i) => (
      <div key={i}>
        <div
          className="w-full flex items-center justify-center"
          style={{ background: "#E8E8E8", height: 400 }}
        >
          <ImageIcon size={40} color="#999" strokeWidth={1.5} />
        </div>
        <div
          className="mt-3 text-center"
          style={{ color: "#999", fontFamily: "Lexend, sans-serif", fontSize: 13 }}
        >
          IMAGE: {label}
        </div>
      </div>
    ))}
  </figure>
);

// Parse content: split by [IMAGE: ...], [GIF: ...], [VIDEO: ...], [CAROUSEL: ...], [INDEX: id|label]
const PLACEHOLDER_RE = /\[(IMAGE|GIF|VIDEO|CAROUSEL|INDEX):\s*([^\]]+)\]/g;
// Detect a metrics-style markdown table: rows like "| value | label |"
// Heuristic: a block where every line starts with "|" and has exactly 2 cells, no header separator.
const METRICS_TABLE_RE = /(?:^|\n)((?:\|[^\n]+\|\s*\n?){2,})/g;
const INDEX_COMMENT_RE = /<!--\s*INDEX:\s*([^>]+?)\s*-->/g;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Part =
  | { type: "md"; value: string }
  | { type: "placeholder"; kind: "IMAGE" | "GIF" | "VIDEO"; label: string }
  | { type: "image-pair"; labels: string[] }
  | { type: "carousel"; label: string }
  | { type: "index-anchor"; id: string; label: string }
  | { type: "metrics"; items: Array<{ value: string; label: string }> };


function parseMetricsTable(block: string): Array<{ value: string; label: string }> | null {
  const lines = block.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const items: Array<{ value: string; label: string }> = [];
  for (const line of lines) {
    if (!line.startsWith("|")) return null;
    const cells = line.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
    if (cells.length !== 2) return null;
    if (/^-+$/.test(cells[0])) return null; // header separator
    items.push({ value: cells[0], label: cells[1] });
  }
  return items.length >= 2 ? items : null;
}

function splitContent(content: string): Part[] {
  const parts: Part[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;

  const placeholders: Array<{ index: number; length: number; kind: any; label: string }> = [];
  while ((match = PLACEHOLDER_RE.exec(content)) !== null) {
    placeholders.push({
      index: match.index,
      length: match[0].length,
      kind: match[1],
      label: match[2].trim(),
    });
  }

  // Walk through, collapsing consecutive IMAGE placeholders (only whitespace between) into pairs
  let i = 0;
  while (i < placeholders.length) {
    const p = placeholders[i];
    if (p.index > lastIndex) {
      parts.push({ type: "md", value: content.slice(lastIndex, p.index) });
    }
    const next = placeholders[i + 1];
    const between = next ? content.slice(p.index + p.length, next.index) : "";
    if (
      next &&
      p.kind === "IMAGE" &&
      next.kind === "IMAGE" &&
      /^\s*$/.test(between)
    ) {
      parts.push({ type: "image-pair", labels: [p.label, next.label] });
      lastIndex = next.index + next.length;
      i += 2;
    } else {
      if (p.kind === "CAROUSEL") {
        parts.push({ type: "carousel", label: p.label });
      } else {
        parts.push({ type: "placeholder", kind: p.kind, label: p.label });
      }
      lastIndex = p.index + p.length;
      i += 1;
    }
  }
  if (lastIndex < content.length) {
    parts.push({ type: "md", value: content.slice(lastIndex) });
  }

  // Second pass: within md parts, extract metrics-style tables
  const final: Part[] = [];
  for (const part of parts) {
    if (part.type !== "md") {
      final.push(part);
      continue;
    }
    const text = part.value;
    let cursor = 0;
    let m: RegExpExecArray | null;
    METRICS_TABLE_RE.lastIndex = 0;
    while ((m = METRICS_TABLE_RE.exec(text)) !== null) {
      const block = m[1];
      const items = parseMetricsTable(block);
      if (!items) continue;
      const blockStart = m.index + (m[0].length - block.length);
      if (blockStart > cursor) {
        final.push({ type: "md", value: text.slice(cursor, blockStart) });
      }
      final.push({ type: "metrics", items });
      cursor = m.index + m[0].length;
    }
    if (cursor < text.length) {
      final.push({ type: "md", value: text.slice(cursor) });
    }
  }
  return final;
}

const Carousel = ({ label }: { label: string }) => {
  const [index, setIndex] = useState(0);
  const total = 5;
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  return (
    <figure className="my-12 md:-mx-[110px]">
      <div className="relative w-full overflow-hidden" style={{ background: "#E8E8E8" }}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="w-full flex-shrink-0 flex items-center justify-center"
              style={{ background: "#E8E8E8", aspectRatio: "4 / 3" }}
            >
              <ImageIcon size={56} color="#999" strokeWidth={1.5} />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Anterior"
          onClick={prev}
          className="absolute top-1/2 -translate-y-1/2 left-3 md:left-5 flex items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.9)",
            color: OLIVE,
            width: 44,
            height: 44,
            border: `1px solid ${OLIVE}`,
          }}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={next}
          className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 flex items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.9)",
            color: OLIVE,
            width: 44,
            height: 44,
            border: `1px solid ${OLIVE}`,
          }}
        >
          <ChevronRight size={22} />
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a slide ${i + 1}`}
            onClick={() => setIndex(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: i === index ? OLIVE : `${OLIVE}33`,
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
      <figcaption
        className="mt-3 text-center"
        style={{ color: "#999", fontFamily: "Lexend, sans-serif", fontSize: 14 }}
      >
        {label}
      </figcaption>
    </figure>
  );
};

const PhaseIndicator = ({
  phases,
  activeIndex,
}: {
  phases: Array<{ id: string; label: string; num: string }>;
  activeIndex: number;
}) => {
  if (phases.length === 0) return null;
  return (
    <div
      className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-5"
      style={{ fontFamily: "Lexend, sans-serif" }}
    >
      {phases.map((p, i) => {
        const active = i === activeIndex;
        return (
          <a
            key={p.id}
            href={`#${p.id}`}
            className="flex items-center gap-3 group"
            style={{ textDecoration: "none" }}
          >
            <span
              style={{
                fontSize: 12,
                color: OLIVE,
                opacity: active ? 1 : 0,
                transition: "opacity 0.25s",
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
            </span>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: OLIVE,
                opacity: active ? 1 : 0.2,
                transition: "opacity 0.25s",
                display: "inline-block",
              }}
            />
          </a>
        );
      })}
    </div>
  );
};

const MetricsBand = ({ items }: { items: Array<{ value: string; label: string }> }) => (
  <div
    className="my-12 md:-mx-[110px]"
    style={{
      background: QUOTE_BG,
      borderRadius: 12,
      padding: "28px 32px",
    }}
  >
    <div
      className="grid gap-8"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`,
      }}
    >
      {items.map((m, i) => (
        <div key={i}>
          <div
            style={{
              fontFamily: "Lexend, sans-serif",
              fontWeight: 700,
              fontSize: 24,
              color: OLIVE,
              lineHeight: 1.2,
            }}
          >
            {m.value}
          </div>
          <div
            style={{
              fontFamily: "Lexend, sans-serif",
              fontSize: 12,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: 8,
            }}
          >
            {m.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const markdownComponents = {
  h2: ({ children }: any) => {
    const text = String(
      Array.isArray(children)
        ? children.map((c: any) => (typeof c === "string" ? c : c?.props?.children ?? "")).join("")
        : children ?? ""
    );
    const m = text.match(/Fase\s*(\d+)/i);
    const id = m ? `fase-${m[1]}` : undefined;
    const isPhase = !!m;
    return (
      <h2
        id={id}
        className="font-bold scroll-mt-24"
        style={{
          fontFamily: "Lexend, sans-serif",
          color: OLIVE,
          marginTop: isPhase ? 64 : 40,
          marginBottom: 14,
          fontSize: isPhase ? 28 : 22,
          lineHeight: 1.3,
          borderTop: isPhase ? `1px solid ${OLIVE}4D` : undefined,
          paddingTop: isPhase ? 16 : undefined,
        }}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: any) => (
    <h3
      className="font-semibold"
      style={{
        fontFamily: "Lexend, sans-serif",
        color: "#1A1A1A",
        marginTop: 28,
        marginBottom: 10,
        fontSize: 18,
        lineHeight: 1.3,
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: 15,
        lineHeight: 1.7,
        color: "#333",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  ),
  blockquote: ({ children }: any) => (
    <blockquote
      className="md:-mx-[90px]"
      style={{
        borderLeft: `3px solid ${OLIVE}`,
        background: QUOTE_BG,
        padding: "20px 28px",
        fontStyle: "italic",
        margin: "28px 0",
        color: "#333",
        fontFamily: "Lexend, sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }: any) => (
    <ul
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: 15,
        lineHeight: 1.8,
        color: "#333",
        paddingLeft: 24,
        marginBottom: 16,
        listStyleType: "disc",
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: 15,
        lineHeight: 1.8,
        color: "#333",
        paddingLeft: 24,
        marginBottom: 16,
        listStyleType: "decimal",
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li style={{ marginBottom: 8 }}>{children}</li>,
  code: ({ inline, children }: any) => {
    if (inline === false) {
      return (
        <pre
          style={{
            background: QUOTE_BG,
            padding: 16,
            overflowX: "auto",
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code
        style={{
          background: OLIVE,
          color: "#fff",
          borderRadius: 4,
          padding: "2px 8px",
          fontSize: 13,
          fontFamily: "Lexend, sans-serif",
        }}
      >
        {children}
      </code>
    );
  },
  a: ({ children, href }: any) => (
    <a href={href} style={{ color: OLIVE, textDecoration: "underline" }}>
      {children}
    </a>
  ),
  strong: ({ children }: any) => (
    <strong style={{ color: "#1A1A1A", fontWeight: 600 }}>{children}</strong>
  ),
};

const ProjectDetail = ({
  title,
  description,
  client,
  year,
  role,
  projectType,
  tools,
  content,
  heroImage,
}: ProjectDetailProps) => {
  useEffect(() => {
    const id = "lexend-font-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const parts = splitContent(content);

  // Extract phases (## Fase N — Title)
  const phases = useMemo(() => {
    const re = /^##\s+(Fase\s*(\d+)[^\n]*)/gim;
    const out: Array<{ id: string; label: string; num: string }> = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const num = m[2];
      const label = m[1].replace(/^#+\s*/, "").trim();
      const id = `fase-${num}`;
      if (!out.find((p) => p.id === id)) {
        out.push({ id, label, num });
      }
    }
    return out;
  }, [content]);

  const [activePhase, setActivePhase] = useState(0);
  useEffect(() => {
    if (phases.length === 0) return;
    const els = phases
      .map((p) => document.getElementById(p.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let idx = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= probe) idx = i;
      });
      setActivePhase(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phases]);

  return (
    <div
      style={{
        background: BG,
        color: "#1A1A1A",
        fontFamily: "Lexend, sans-serif",
        minHeight: "100vh",
      }}
    >
      <PhaseIndicator phases={phases} activeIndex={activePhase} />

      {/* Sticky nav */}
      <nav
        className="sticky top-0 z-40"
        style={{
          background: BG,
          borderBottom: "1px solid #E8E8E8",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-16 h-14 flex items-center justify-between">
          <span
            className="truncate"
            style={{ fontFamily: "Lexend, sans-serif", fontSize: 14, color: "#1A1A1A" }}
          >
            {title}
          </span>
          <Link
            to="/lado-a"
            style={{ color: OLIVE, fontSize: 14, fontFamily: "Lexend, sans-serif" }}
          >
            ← Volver
          </Link>
        </div>
      </nav>

      {/* HERO con overlay y título superpuesto */}
      <header>
        <div
          className="relative w-full"
          style={{
            minHeight: 480,
            background: heroImage ? undefined : "#D9D9D9",
            backgroundImage: heroImage ? `url(${heroImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)",
            }}
          />
          {/* Título bottom-left */}
          <div className="absolute inset-0 flex items-end">
            <h1
              style={{
                fontFamily: "Lexend, sans-serif",
                fontWeight: 700,
                color: "#fff",
                padding: 40,
                fontSize: 28,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
              className="md:!text-[36px]"
            >
              {title}
            </h1>
          </div>
        </div>

        {/* Chips de metadata DEBAJO del hero */}
        <div className="max-w-5xl mx-auto px-6 md:px-16 mt-8">
          <div
            className="flex flex-wrap gap-x-8 gap-y-4 items-start"
            style={{ borderBottom: "1px solid #E8E8E8", paddingBottom: 24 }}
          >
            <MetaChip label="Cliente" value={client} />
            <div className="hidden md:block self-stretch" style={{ width: 1, background: "#E0E0E0" }} />
            <MetaChip label="Año" value={year} />
            <div className="hidden md:block self-stretch" style={{ width: 1, background: "#E0E0E0" }} />
            <MetaChip label="Rol" value={role.join(" · ")} />
            <div className="hidden md:block self-stretch" style={{ width: 1, background: "#E0E0E0" }} />
            <MetaChip label="Tipo" value={projectType.join(" · ")} />
          </div>
        </div>
      </header>

      {/* DESCRIPCIÓN CORTA */}
      <section className="px-6 md:px-16 pt-10 pb-6">
        <p
          style={{
            fontFamily: "Lexend, sans-serif",
            fontSize: 16,
            color: "#444",
            maxWidth: 720,
            margin: "0 auto",
            lineHeight: 1.65,
          }}
        >
          {description}
        </p>
      </section>

      {/* CUERPO */}
      <article
        className="mx-auto px-6 md:px-16 pb-12 relative"
        style={{ maxWidth: 680 }}
      >
        {parts.map((part, i) => {
          if (part.type === "md") {
            return (
              <ReactMarkdown
                key={i}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents as any}
              >
                {part.value}
              </ReactMarkdown>
            );
          }
          if (part.type === "placeholder") {
            return <PlaceholderBlock key={i} kind={part.kind} label={part.label} />;
          }
          if (part.type === "image-pair") {
            return <ImagePairBlock key={i} labels={part.labels} />;
          }
          if (part.type === "carousel") {
            return <Carousel key={i} label={part.label} />;
          }
          if (part.type === "metrics") {
            return <MetricsBand key={i} items={part.items} />;
          }
          return null;
        })}

        {/* Herramientas */}
        {tools.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: 13,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 12,
              }}
            >
              Herramientas
            </h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <span
                  key={t}
                  style={{
                    background: OLIVE,
                    color: "#fff",
                    borderRadius: 4,
                    padding: "4px 10px",
                    fontSize: 13,
                    fontFamily: "Lexend, sans-serif",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Volver */}
      <div className="max-w-3xl mx-auto px-6 md:px-16 py-16 flex justify-center">
        <Link
          to="/lado-a"
          style={{
            border: `1px solid ${OLIVE}`,
            color: OLIVE,
            padding: "10px 20px",
            fontFamily: "Lexend, sans-serif",
            fontSize: 14,
            background: "transparent",
          }}
        >
          ← Volver al portafolio
        </Link>
      </div>
    </div>
  );
};

export const ProjectMetrics = ({
  items,
}: {
  items: Array<{ value: string; label: string }>;
}) => <MetricsBand items={items} />;

export default ProjectDetail;
