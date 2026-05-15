import { useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Image as ImageIcon, Film, Play } from "lucide-react";

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

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center whitespace-nowrap text-xs"
    style={{
      border: `1px solid ${OLIVE}`,
      color: OLIVE,
      background: "transparent",
      borderRadius: 999,
      padding: "4px 12px",
    }}
  >
    {children}
  </span>
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
    <figure className="my-10">
      <div
        className="w-full flex items-center justify-center"
        style={{
          background: "#E8E8E8",
          height: isVideo ? 400 : 360,
        }}
      >
        <Icon size={48} color="#999" strokeWidth={1.5} />
      </div>
      <figcaption
        className="mt-3 text-center"
        style={{ color: "#999", fontFamily: "Lexend, sans-serif", fontSize: 14 }}
      >
        {kind}: {label}
      </figcaption>
    </figure>
  );
};

// Parse content: split by [IMAGE: ...], [GIF: ...], [VIDEO: ...]
const PLACEHOLDER_RE = /\[(IMAGE|GIF|VIDEO):\s*([^\]]+)\]/g;

function splitContent(content: string) {
  const parts: Array<
    | { type: "md"; value: string }
    | { type: "placeholder"; kind: "IMAGE" | "GIF" | "VIDEO"; label: string }
  > = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((match = PLACEHOLDER_RE.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "md", value: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "placeholder",
      kind: match[1] as "IMAGE" | "GIF" | "VIDEO",
      label: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "md", value: content.slice(lastIndex) });
  }
  return parts;
}

const markdownComponents = {
  h2: ({ children }: any) => (
    <h2
      className="font-bold"
      style={{
        fontFamily: "Lexend, sans-serif",
        color: OLIVE,
        marginTop: 48,
        marginBottom: 16,
        fontSize: 28,
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3
      className="font-semibold"
      style={{
        fontFamily: "Lexend, sans-serif",
        color: "#1A1A1A",
        marginTop: 32,
        marginBottom: 12,
        fontSize: 20,
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: 16,
        lineHeight: 1.8,
        color: "#333",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  ),
  blockquote: ({ children }: any) => (
    <blockquote
      style={{
        borderLeft: `3px solid ${OLIVE}`,
        background: "#F3F4EE",
        padding: "16px 24px",
        fontStyle: "italic",
        margin: "24px 0",
        color: "#333",
        fontFamily: "Lexend, sans-serif",
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }: any) => (
    <ul
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: 16,
        lineHeight: 1.9,
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
        fontSize: 16,
        lineHeight: 1.9,
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
            background: "#F3F4EE",
            padding: 16,
            overflowX: "auto",
            fontFamily: "monospace",
            fontSize: 14,
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

  return (
    <div
      style={{
        background: BG,
        color: "#1A1A1A",
        fontFamily: "Lexend, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* Sticky nav */}
      <nav
        className="sticky top-0 z-40"
        style={{
          background: BG,
          borderBottom: "1px solid #E8E8E8",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span style={{ fontFamily: "Lexend, sans-serif", fontSize: 14, color: "#1A1A1A" }}>
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

      {/* HERO */}
      <header>
        <div
          className="w-full flex items-center justify-center"
          style={{
            height: 480,
            background: heroImage ? undefined : "#D9D9D9",
            backgroundImage: heroImage ? `url(${heroImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!heroImage && (
            <span style={{ color: "#B0B0B0", fontSize: 16, fontFamily: "Lexend, sans-serif" }}>
              Hero: {title}
            </span>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-6 mt-8">
          <h1
            style={{
              fontFamily: "Lexend, sans-serif",
              fontWeight: 600,
              fontSize: 40,
              color: "#1A1A1A",
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h1>
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "thin" }}
          >
            <Chip>{client}</Chip>
            <Chip>{year}</Chip>
            {role.map((r) => (
              <Chip key={`r-${r}`}>{r}</Chip>
            ))}
            {projectType.map((t) => (
              <Chip key={`t-${t}`}>{t}</Chip>
            ))}
          </div>
        </div>
      </header>

      {/* DESCRIPCIÓN CORTA */}
      <section className="px-6 py-16">
        <p
          style={{
            fontFamily: "Lexend, sans-serif",
            fontSize: 18,
            color: "#444",
            maxWidth: 720,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      </section>

      {/* CUERPO */}
      <article className="max-w-3xl mx-auto px-6 pb-12">
        {parts.map((part, i) =>
          part.type === "md" ? (
            <ReactMarkdown
              key={i}
              remarkPlugins={[remarkGfm]}
              components={markdownComponents as any}
            >
              {part.value}
            </ReactMarkdown>
          ) : (
            <PlaceholderBlock key={i} kind={part.kind} label={part.label} />
          ),
        )}

        {/* Herramientas */}
        {tools.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: 14,
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
      <div className="max-w-3xl mx-auto px-6 py-16 flex justify-center">
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

/**
 * Renders a metrics grid. Use within `content` is not markdown-friendly,
 * so this is exported for callers who want to compose pages with metrics.
 */
export const ProjectMetrics = ({
  items,
}: {
  items: Array<{ value: string; label: string }>;
}) => (
  <div
    className="grid gap-8 my-12"
    style={{
      gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
    }}
  >
    {items.map((m) => (
      <div key={m.label}>
        <div
          style={{
            fontFamily: "Lexend, sans-serif",
            fontWeight: 700,
            fontSize: 48,
            color: OLIVE,
            lineHeight: 1.1,
          }}
        >
          {m.value}
        </div>
        <div
          style={{
            fontFamily: "Lexend, sans-serif",
            fontSize: 14,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginTop: 8,
          }}
        >
          {m.label}
        </div>
      </div>
    ))}
  </div>
);

export default ProjectDetail;
