import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { projects } from "@/data/projects";
import Seo from "@/components/Seo";

const OLIVE = "#6B7A3E";
const BG = "#FAFAF7";
const QUOTE_BG = "#F3F4EE";

type RichText = { plain_text: string; href?: string | null; annotations?: any };
type Block = { id: string; type: string; has_children?: boolean; children?: Block[]; [k: string]: any };
type NotionProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cliente: string[];
  rol: string[];
  tipo: string[];
  herramientas: string[];
  estado: string | null;
  fecha: string | null;
  destacado: boolean;
  cover: string | null;
  blocks: Block[];
};

const RT = ({ rich }: { rich: RichText[] }) => (
  <>
    {(rich || []).map((t, i) => {
      const a = t.annotations || {};
      let el: React.ReactNode = t.plain_text;
      if (a.code) el = <code key={i} style={{ background: QUOTE_BG, padding: "1px 5px", fontSize: "0.92em" }}>{el}</code>;
      const style: React.CSSProperties = {
        fontWeight: a.bold ? 600 : undefined,
        fontStyle: a.italic ? "italic" : undefined,
        textDecoration: [a.underline && "underline", a.strikethrough && "line-through"].filter(Boolean).join(" ") || undefined,
      };
      const node = <span key={i} style={style}>{el}</span>;
      return t.href ? (
        <a key={i} href={t.href} target="_blank" rel="noreferrer" style={{ color: OLIVE, textDecoration: "underline" }}>{node}</a>
      ) : node;
    })}
  </>
);

const MetaChip = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span style={{ fontFamily: "Lexend, sans-serif", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</span>
    <span style={{ fontFamily: "Lexend, sans-serif", fontSize: 13, color: OLIVE }}>{value}</span>
  </div>
);

const callout = (b: Block) => {
  const d = b.callout || {};
  const icon = d.icon?.type === "emoji" ? d.icon.emoji : null;
  return (
    <div key={b.id} style={{ display: "flex", gap: 12, background: QUOTE_BG, padding: "14px 16px", borderRadius: 6, margin: "18px 0", borderLeft: `3px solid ${OLIVE}` }}>
      {icon && <span style={{ fontSize: 18, lineHeight: "1.6" }}>{icon}</span>}
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#1A1A1A", fontFamily: "Lexend, sans-serif" }}>
        <RT rich={d.rich_text || []} />
        {b.children && b.children.length > 0 && <div style={{ marginTop: 8 }}>{renderBlocks(b.children)}</div>}
      </div>
    </div>
  );
};

const renderTable = (b: Block) => {
  const rows: Block[] = b.children || [];
  if (!rows.length) return null;
  const hasHeader = b.table?.has_column_header;
  return (
    <div key={b.id} style={{ overflowX: "auto", margin: "20px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: "Lexend, sans-serif" }}>
        <tbody>
          {rows.map((row, ri) => {
            const cells: RichText[][] = row.table_row?.cells || [];
            const Tag = hasHeader && ri === 0 ? "th" : "td";
            return (
              <tr key={row.id} style={{ borderBottom: "1px solid #E8E8E8" }}>
                {cells.map((cell, ci) => (
                  <Tag key={ci} style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "top", color: "#1A1A1A", fontWeight: Tag === "th" ? 600 : 400, background: Tag === "th" ? QUOTE_BG : undefined }}>
                    <RT rich={cell} />
                  </Tag>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function renderBlocks(blocks: Block[]): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    const type = b.type;
    const data = b[type];

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const items: Block[] = [];
      while (i < blocks.length && blocks[i].type === type) {
        items.push(blocks[i]); i++;
      }
      const ListTag = type === "bulleted_list_item" ? "ul" : "ol";
      out.push(
        <ListTag key={b.id} style={{ paddingLeft: 24, marginBottom: 16, listStyleType: type === "bulleted_list_item" ? "disc" : "decimal", color: OLIVE, fontFamily: "Lexend, sans-serif" }}>
          {items.map((it) => {
            const d = it[it.type];
            return (
              <li key={it.id} style={{ marginBottom: 6, fontSize: 15, lineHeight: 1.8 }}>
                <span style={{ color: "#1A1A1A" }}><RT rich={d.rich_text || []} /></span>
                {it.children && it.children.length > 0 && <div>{renderBlocks(it.children)}</div>}
              </li>
            );
          })}
        </ListTag>
      );
      continue;
    }

    switch (type) {
      case "paragraph":
        if (!data.rich_text?.length) {
          out.push(<div key={b.id} style={{ height: 12 }} />);
        } else {
          out.push(
            <p key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontSize: 15, lineHeight: 1.75, color: "#1A1A1A", marginBottom: 16 }}>
              <RT rich={data.rich_text} />
            </p>
          );
        }
        break;
      case "heading_1":
        out.push(<h1 key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, fontSize: 30, color: OLIVE, marginTop: 40, marginBottom: 14, letterSpacing: "-0.02em" }}><RT rich={data.rich_text || []} /></h1>);
        break;
      case "heading_2":
        out.push(<h2 key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, fontSize: 22, color: OLIVE, marginTop: 32, marginBottom: 12 }}><RT rich={data.rich_text || []} /></h2>);
        break;
      case "heading_3":
        out.push(<h3 key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontWeight: 600, fontSize: 18, color: "#1A1A1A", marginTop: 24, marginBottom: 10 }}><RT rich={data.rich_text || []} /></h3>);
        break;
      case "quote":
        out.push(
          <blockquote key={b.id} style={{ borderLeft: `3px solid ${OLIVE}`, background: QUOTE_BG, padding: "14px 18px", margin: "20px 0", fontStyle: "italic", fontSize: 15, lineHeight: 1.7, color: "#1A1A1A", fontFamily: "Lexend, sans-serif" }}>
            <RT rich={data.rich_text || []} />
          </blockquote>
        );
        break;
      case "callout":
        out.push(callout(b));
        break;
      case "image": {
        const src = data.type === "external" ? data.external?.url : data.file?.url;
        const caption = (data.caption || []).map((c: RichText) => c.plain_text).join("");
        out.push(
          <figure key={b.id} style={{ margin: "24px 0" }}>
            {src && <img src={src} alt={caption || ""} style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" />}
            {caption && <figcaption style={{ fontSize: 13, color: "#666", textAlign: "center", marginTop: 8, fontFamily: "Lexend, sans-serif" }}>{caption}</figcaption>}
          </figure>
        );
        break;
      }
      case "divider":
        out.push(<hr key={b.id} style={{ border: 0, borderTop: "1px solid #E8E8E8", margin: "28px 0" }} />);
        break;
      case "table":
        out.push(renderTable(b));
        break;
      case "toggle":
        out.push(
          <details key={b.id} style={{ margin: "12px 0", fontFamily: "Lexend, sans-serif" }}>
            <summary style={{ cursor: "pointer", color: OLIVE, fontSize: 15, padding: "6px 0" }}>
              <RT rich={data.rich_text || []} />
            </summary>
            {b.children && <div style={{ marginTop: 8, paddingLeft: 16 }}>{renderBlocks(b.children)}</div>}
          </details>
        );
        break;
      case "code":
        out.push(
          <pre key={b.id} style={{ background: "#1A1A1A", color: "#FAFAF7", padding: 16, borderRadius: 6, overflowX: "auto", fontSize: 13, margin: "16px 0" }}>
            <code>{(data.rich_text || []).map((r: RichText) => r.plain_text).join("")}</code>
          </pre>
        );
        break;
      case "bookmark":
      case "embed":
      case "video": {
        const u = data.url || (data.type === "external" ? data.external?.url : data.file?.url);
        if (u) out.push(<p key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontSize: 14 }}><a href={u} target="_blank" rel="noreferrer" style={{ color: OLIVE, textDecoration: "underline" }}>{u}</a></p>);
        break;
      }
      default:
        if (data?.rich_text?.length) {
          out.push(
            <p key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontSize: 15, lineHeight: 1.75, color: "#1A1A1A", marginBottom: 16 }}>
              <RT rich={data.rich_text} />
            </p>
          );
        }
    }
    i++;
  }
  return out;
}

export default function NotionProjectDetail({ slug }: { slug: string }) {
  const [project, setProject] = useState<NotionProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = "lexend-font-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    supabase.functions
      .invoke("get-portfolio-project-by-slug", { body: { slug } })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data?.project) { setError(true); setProject(null); }
        else setProject(data.project as NotionProject);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  // Fallback hero/title from static data if Notion misses cover
  const staticFallback = useMemo(() => projects.find((p) => p.id === slug), [slug]);

  const nextProject = useMemo(() => {
    const i = projects.findIndex((p) => p.id === slug);
    if (i === -1) return projects[0];
    return projects[(i + 1) % projects.length];
  }, [slug]);

  const heroImage = project?.cover || staticFallback?.heroImage;
  const title = project?.title || staticFallback?.title || "";
  const description = project?.description || staticFallback?.description || "";
  const year = project?.fecha ? new Date(project.fecha).getFullYear().toString() : (staticFallback?.year || "");
  const cliente = project?.cliente.length ? project.cliente.join(" · ") : (staticFallback?.client || "");
  const rol = project?.rol.length ? project.rol.join(" · ") : (staticFallback?.role.join(" · ") || "");
  const tipo = project?.tipo.length ? project.tipo.join(" · ") : (staticFallback?.projectType.join(" · ") || "");
  const tools = project?.herramientas.length ? project.herramientas : (staticFallback?.tools || []);

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: "100vh", fontFamily: "Lexend, sans-serif" }}>
        <div className="max-w-3xl mx-auto px-6 pt-32">
          <div className="animate-pulse">
            <div style={{ height: 40, width: "70%", background: "#E8E8E8", marginBottom: 16 }} />
            <div style={{ height: 16, width: "40%", background: "#E8E8E8", marginBottom: 32 }} />
            <div style={{ height: 12, width: "100%", background: "#E8E8E8", marginBottom: 10 }} />
            <div style={{ height: 12, width: "95%", background: "#E8E8E8", marginBottom: 10 }} />
            <div style={{ height: 12, width: "85%", background: "#E8E8E8" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error && !staticFallback) {
    return (
      <div style={{ background: BG, minHeight: "100vh", fontFamily: "Lexend, sans-serif" }}>
        <div className="max-w-3xl mx-auto px-6 pt-32 text-center">
          <p style={{ color: "#666" }}>Proyecto no encontrado.</p>
          <Link to="/" style={{ color: OLIVE, marginTop: 16, display: "inline-block" }}>← Volver</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, color: "#1A1A1A", fontFamily: "Lexend, sans-serif", minHeight: "100vh" }}>
      {title && (
        <Seo
          title={`${title.split(":")[0].split("/")[0].trim()} — Portafolio · Karien Díaz Valdez`}
          description={description || `Caso de estudio: ${title}. Portafolio de diseño de servicios de Karien Díaz Valdez.`}
          path={`/portafolio/${slug}`}
          image={heroImage || undefined}
          type="article"
        />
      )}
      {/* Sticky nav */}
      <nav className="sticky top-0 z-40" style={{ background: BG, borderBottom: "1px solid #E8E8E8" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-16 h-14 flex items-center justify-between">
          <Link to="/" style={{ fontFamily: "Lexend, sans-serif", fontSize: 14, color: "#1A1A1A", textDecoration: "none" }}>Karien.xyz</Link>
          <Link to="/" style={{ color: OLIVE, fontSize: 14, fontFamily: "Lexend, sans-serif" }}>← Volver</Link>
        </div>
      </nav>

      {/* HERO */}
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)" }} />
          <div className="absolute inset-0 flex items-end">
            <h1
              className="md:!text-[36px]"
              style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, color: "#fff", padding: 40, fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.01em" }}
            >
              {title}
            </h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-16 mt-8">
          <div className="flex flex-wrap gap-x-8 gap-y-4 items-start" style={{ borderBottom: "1px solid #E8E8E8", paddingBottom: 24 }}>
            {cliente && <MetaChip label="Cliente" value={cliente} />}
            {year && cliente && <div className="hidden md:block self-stretch" style={{ width: 1, background: "#E0E0E0" }} />}
            {year && <MetaChip label="Año" value={year} />}
            {rol && <div className="hidden md:block self-stretch" style={{ width: 1, background: "#E0E0E0" }} />}
            {rol && <MetaChip label="Rol" value={rol} />}
            {tipo && <div className="hidden md:block self-stretch" style={{ width: 1, background: "#E0E0E0" }} />}
            {tipo && <MetaChip label="Tipo" value={tipo} />}
          </div>
        </div>
      </header>

      {/* DESCRIPCIÓN */}
      {description && (
        <section className="px-6 md:px-16 pt-10 pb-6">
          <p style={{ fontFamily: "Lexend, sans-serif", fontSize: 16, color: "#444", maxWidth: 720, margin: "0 auto", lineHeight: 1.65 }}>
            {description}
          </p>
        </section>
      )}

      {/* CUERPO (Notion blocks) */}
      <article className="mx-auto px-6 md:px-16 pb-12" style={{ maxWidth: 680 }}>
        {project?.blocks ? renderBlocks(project.blocks) : null}

        {tools.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontFamily: "Lexend, sans-serif", fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Herramientas</h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <span key={t} style={{ background: OLIVE, color: "#fff", borderRadius: 4, padding: "4px 10px", fontSize: 13, fontFamily: "Lexend, sans-serif" }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </article>

      {nextProject && (
        <div className="max-w-3xl mx-auto px-6 md:px-16 py-16 flex justify-center">
          <Link to={`/portafolio/${nextProject.id}`} style={{ border: `1px solid ${OLIVE}`, color: OLIVE, padding: "10px 20px", fontFamily: "Lexend, sans-serif", fontSize: 14, background: "transparent" }}>
            Siguiente caso: {nextProject.title.split(":")[0].split("/")[0].trim()} →
          </Link>
        </div>
      )}
    </div>
  );
}
