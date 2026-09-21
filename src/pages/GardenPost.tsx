import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

type RichText = {
  plain_text: string;
  href?: string | null;
  type?: string;
  equation?: { expression?: string };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    color?: string;
  };
};
type Block = { id: string; type: string; children?: Block[]; [k: string]: any };
type Post = {
  id: string;
  nombre: string;
  category: string;
  date: string;
  excerpt: string;
  maturity: string;
  temas: string[];
  tipo: string;
  coverUrl?: string;
  blocks: Block[];
};

const TERRACOTA = "#C4622D";
const BG = "#FAFAF8";
const INK = "#1C1A17";
const BORDER_FAINT = "0.5px solid rgba(28, 26, 23, 0.15)";
const NOTION_COLORS: Record<string, string> = {
  gray: "#787774", brown: "#9F6B53", orange: "#D9730D", yellow: "#CB912F",
  green: "#448361", blue: "#337EA9", purple: "#9065B0", pink: "#C14C8A", red: "#D44C47",
};
const NOTION_BACKGROUNDS: Record<string, string> = {
  gray_background: "#F1F1EF", brown_background: "#F4EEEE", orange_background: "#FAEBDD",
  yellow_background: "#FBF3DB", green_background: "#EDF3EC", blue_background: "#E7F3F8",
  purple_background: "#F4F0F7", pink_background: "#F9EEF3", red_background: "#FDEBEC",
};

const maturityIcon = (m: string) => {
  const k = (m || "").toLowerCase();
  if (k.includes("brote")) return "🌿";
  if (k.includes("fruto")) return "🍂";
  if (k.includes("semilla")) return "🌱";
  return "";
};

const fmtDate = (d: string) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
};

const RT = ({ rich }: { rich: RichText[] }) => (
  <>
    {(rich || []).map((t, i) => {
      const a = t.annotations || {};
      let el: React.ReactNode = t.type === "equation" ? t.equation?.expression || t.plain_text : t.plain_text;
      if (a.code) el = <code key={i} className="rounded-xl px-1.5 py-0.5 bg-[#F3EDE6] text-[0.9em]">{el}</code>;
      const notionColor = a.color && a.color !== "default" ? a.color : undefined;
      const style: React.CSSProperties = {
        fontWeight: a.bold ? 600 : undefined,
        fontStyle: a.italic ? "italic" : undefined,
        textDecoration: [a.underline && "underline", a.strikethrough && "line-through"].filter(Boolean).join(" ") || undefined,
        color: notionColor ? NOTION_COLORS[notionColor] : undefined,
        background: notionColor ? NOTION_BACKGROUNDS[notionColor] : undefined,
      };
      const node = <span key={i} style={style}>{el}</span>;
      return t.href ? (
        <a key={i} href={t.href} target="_blank" rel="noreferrer" style={{ color: TERRACOTA, textDecoration: "underline" }}>
          {node}
        </a>
      ) : node;
    })}
  </>
);

const getMediaUrl = (data: any) => data?.type === "external" ? data.external?.url : data?.file?.url;
const getCaption = (data: any) => (data?.caption || []).map((c: RichText) => c.plain_text).join("");

const renderBlocks = (blocks: Block[], depth = 0) => {
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    const type = b.type;
    const data = b[type];

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const items: Block[] = [];
      while (i < blocks.length && blocks[i].type === type) {
        items.push(blocks[i]);
        i++;
      }
      const ListTag = type === "bulleted_list_item" ? "ul" : "ol";
      out.push(
        <ListTag
          key={b.id}
          style={{
            paddingLeft: 24,
            marginBottom: 16,
            listStyleType: type === "bulleted_list_item" ? "disc" : "decimal",
            color: TERRACOTA,
          }}
        >
          {items.map((it) => {
            const d = it[it.type];
            return (
              <li key={it.id} style={{ marginBottom: 6, fontSize: 16, lineHeight: 1.8 }}>
                <span style={{ color: INK }}>
                  <RT rich={d.rich_text || []} />
                </span>
                {it.children && it.children.length > 0 && renderBlocks(it.children, depth + 1)}
              </li>
            );
          })}
        </ListTag>,
      );
      continue;
    }

    switch (type) {
      case "paragraph":
        out.push(
          <div key={b.id}>
          <p className="font-quicksand" style={{ fontSize: 16, lineHeight: 1.8, color: INK, marginBottom: 16, minHeight: data.rich_text?.length ? undefined : 16 }}>
            <RT rich={data.rich_text || []} />
          </p>
          {b.children && b.children.length > 0 && renderBlocks(b.children, depth + 1)}
          </div>,
        );
        break;
      case "heading_1":
        out.push(
          <div key={b.id}>
          <h1 className="font-quicksand" style={{ fontWeight: 700, fontSize: 32, color: TERRACOTA, marginTop: 32, marginBottom: 16, letterSpacing: "-0.01em" }}>
            <RT rich={data.rich_text || []} />
          </h1>
          {b.children && b.children.length > 0 && renderBlocks(b.children, depth + 1)}
          </div>,
        );
        break;
      case "heading_2":
        out.push(
          <div key={b.id}>
          <h2 className="font-quicksand" style={{ fontWeight: 700, fontSize: 22, color: TERRACOTA, marginTop: 28, marginBottom: 12 }}>
            <RT rich={data.rich_text || []} />
          </h2>
          {b.children && b.children.length > 0 && renderBlocks(b.children, depth + 1)}
          </div>,
        );
        break;
      case "heading_3":
        out.push(
          <div key={b.id}>
          <h3 className="font-quicksand" style={{ fontWeight: 600, fontSize: 18, color: INK, marginTop: 24, marginBottom: 10 }}>
            <RT rich={data.rich_text || []} />
          </h3>
          {b.children && b.children.length > 0 && renderBlocks(b.children, depth + 1)}
          </div>,
        );
        break;
      case "quote":
        out.push(
          <blockquote
            key={b.id}
            className="font-quicksand"
            style={{
              borderLeft: `3px solid ${TERRACOTA}`,
              background: "#F3EDE6",
              padding: "14px 18px",
              margin: "20px 0",
              fontStyle: "italic",
              fontSize: 15,
              lineHeight: 1.7,
              color: INK,
            }}
          >
            <RT rich={data.rich_text || []} />
            {b.children && b.children.length > 0 && <div className="mt-3">{renderBlocks(b.children, depth + 1)}</div>}
          </blockquote>,
        );
        break;
      case "image": {
        const src = getMediaUrl(data);
        const caption = getCaption(data);
        out.push(
          <figure key={b.id} style={{ margin: "32px 0" }}>
            {src && <img src={src} alt={caption || ""} className="w-full rounded-2xl object-contain" loading="lazy" />}
            {caption && (
              <figcaption style={{ fontSize: 13, color: "#777", textAlign: "center", marginTop: 8 }}>{caption}</figcaption>
            )}
          </figure>,
        );
        break;
      }
      case "callout":
        out.push(
          <aside key={b.id} className="my-6 flex gap-3 rounded-2xl p-5" style={{ background: NOTION_BACKGROUNDS[data.color] || "#F3EDE6" }}>
            <span aria-hidden="true">{data.icon?.emoji || "💡"}</span>
            <div className="min-w-0 flex-1 text-base leading-7"><RT rich={data.rich_text || []} />{b.children && renderBlocks(b.children, depth + 1)}</div>
          </aside>,
        );
        break;
      case "code":
        out.push(
          <figure key={b.id} className="my-7 overflow-hidden rounded-2xl" style={{ background: "#24211E", color: "#F7F2EA" }}>
            {data.language && <figcaption className="px-5 pt-4 text-xs opacity-60">{data.language}</figcaption>}
            <pre className="overflow-x-auto p-5 pt-3 text-sm leading-6"><code>{(data.rich_text || []).map((t: RichText) => t.plain_text).join("")}</code></pre>
          </figure>,
        );
        break;
      case "toggle":
        out.push(
          <details key={b.id} className="my-4 rounded-2xl border p-4" style={{ border: BORDER_FAINT }}>
            <summary className="cursor-pointer font-semibold"><RT rich={data.rich_text || []} /></summary>
            {b.children && <div className="mt-4 pl-4">{renderBlocks(b.children, depth + 1)}</div>}
          </details>,
        );
        break;
      case "to_do":
        out.push(
          <div key={b.id} className="mb-3 flex items-start gap-3 text-base leading-7">
            <input type="checkbox" checked={Boolean(data.checked)} readOnly className="mt-1.5 h-4 w-4 accent-[#C4622D]" />
            <div><RT rich={data.rich_text || []} />{b.children && renderBlocks(b.children, depth + 1)}</div>
          </div>,
        );
        break;
      case "bookmark":
      case "link_preview":
        out.push(
          <a key={b.id} href={data.url} target="_blank" rel="noreferrer" className="my-5 block rounded-2xl border p-4 text-sm break-all" style={{ border: BORDER_FAINT, color: TERRACOTA }}>
            {data.url}
            {getCaption(data) && <span className="mt-2 block" style={{ color: INK }}>{getCaption(data)}</span>}
          </a>,
        );
        break;
      case "video":
      case "embed": {
        const src = getMediaUrl(data) || data.url;
        out.push(
          <figure key={b.id} className="my-8">
            {src && (type === "video" && data.type === "file" ? (
              <video src={src} controls className="aspect-video w-full rounded-2xl" />
            ) : (
              <iframe src={src} title={getCaption(data) || "Contenido multimedia"} className="aspect-video w-full rounded-2xl" loading="lazy" allowFullScreen />
            ))}
            {getCaption(data) && <figcaption className="mt-2 text-center text-xs" style={{ color: "#777" }}>{getCaption(data)}</figcaption>}
          </figure>,
        );
        break;
      }
      case "file":
      case "pdf": {
        const src = getMediaUrl(data);
        out.push(src ? <a key={b.id} href={src} target="_blank" rel="noreferrer" className="my-4 inline-flex rounded-full border px-4 py-2 text-sm" style={{ border: BORDER_FAINT, color: TERRACOTA }}>Abrir {type === "pdf" ? "PDF" : "archivo"} ↗</a> : null);
        break;
      }
      case "audio": {
        const src = getMediaUrl(data);
        out.push(src ? <audio key={b.id} src={src} controls className="my-6 w-full" /> : null);
        break;
      }
      case "equation":
        out.push(<div key={b.id} className="my-6 overflow-x-auto py-3 text-center font-mono text-lg">{data.expression}</div>);
        break;
      case "table":
        out.push(
          <div key={b.id} className="my-7 overflow-x-auto rounded-2xl border" style={{ border: BORDER_FAINT }}>
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <tbody>{b.children?.map((row, rowIndex) => {
                const cells = row.table_row?.cells || [];
                return <tr key={row.id}>{cells.map((cell: RichText[], cellIndex: number) => {
                  const Cell = data.has_column_header && rowIndex === 0 ? "th" : "td";
                  return <Cell key={`${row.id}-${cellIndex}`} className="border-b border-r p-3 align-top last:border-r-0" style={{ borderColor: "rgba(28, 26, 23, 0.12)", fontWeight: Cell === "th" ? 600 : 400 }}><RT rich={cell} /></Cell>;
                })}</tr>;
              })}</tbody>
            </table>
          </div>,
        );
        break;
      case "synced_block":
        out.push(<div key={b.id}>{renderBlocks(b.children || [], depth + 1)}</div>);
        break;
      case "column_list":
        out.push(<div key={b.id} className="my-6 grid gap-6 md:grid-cols-2">{b.children?.map((child) => <div key={child.id} className="min-w-0">{renderBlocks(child.children || [], depth + 1)}</div>)}</div>);
        break;
      case "column":
        out.push(<div key={b.id}>{renderBlocks(b.children || [], depth + 1)}</div>);
        break;
      case "divider":
        out.push(<hr key={b.id} style={{ border: 0, borderTop: "1px solid #E8E8E8", margin: "24px 0" }} />);
        break;
      default:
        if (data?.rich_text) {
          out.push(
            <p key={b.id} className="font-quicksand" style={{ fontSize: 16, lineHeight: 1.8, color: INK, marginBottom: 16 }}>
              <RT rich={data.rich_text} />
            </p>,
          );
        }
    }
    i++;
  }
  return out;
};

const GardenPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    supabase.functions
      .invoke("get-garden-post-by-slug", { body: { slug } })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data?.post) {
          setError(true);
          setPost(null);
        } else {
          setPost(data.post);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const icon = post ? maturityIcon(post.maturity) : "";

  return (
    <div className="font-quicksand min-h-screen" style={{ background: BG, color: INK }}>
      {post && (
        <Seo
          title={`${post.nombre} — Jardín · Karien Díaz Valdez`}
          description={post.excerpt || `${post.nombre}. Nota del jardín digital de Karien Díaz Valdez.`}
          path={`/jardin/${slug}`}
          type="article"
        />
      )}
      <nav className="fixed top-0 left-0 right-0 z-40" style={{ background: BG, borderBottom: BORDER_FAINT }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium" style={{ color: INK }}>Karien.xyz</Link>
          <Link to="/lado-b" style={{ color: TERRACOTA, fontSize: 14 }}>← Lado B</Link>
        </div>
      </nav>

      <article className="pt-16 pb-24">
        {loading ? (
          <div className="mx-auto max-w-5xl animate-pulse px-6 pt-16 md:px-10">
            <div className="h-3 w-24 bg-[#E8E2DA] mb-4" />
            <div className="h-10 w-full bg-[#E8E2DA] mb-4" />
            <div className="h-10 w-3/4 bg-[#E8E2DA] mb-8" />
            <div className="h-3 w-32 bg-[#E8E2DA] mb-10" />
            <div className="h-4 w-full bg-[#E8E2DA] mb-3" />
            <div className="h-4 w-full bg-[#E8E2DA] mb-3" />
            <div className="h-4 w-5/6 bg-[#E8E2DA]" />
          </div>
        ) : error || !post ? (
          <p className="text-center py-16" style={{ color: "#999" }}>Nota no encontrada</p>
        ) : (
          <>
            {post.coverUrl && (
              <div
                className="relative mb-12 h-[42vh] min-h-[280px] w-full overflow-hidden md:h-[52vh] md:min-h-[380px] md:max-h-[620px]"
                style={{ background: INK }}
              >
                <img
                  src={post.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, rgba(28, 26, 23, 0.14) 0%, rgba(28, 26, 23, 0.58) 100%)",
                  }}
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="mx-auto w-full max-w-5xl px-6 md:px-10">
            {(icon || post.maturity) && (
              <p className="font-caveat" style={{ color: TERRACOTA, fontSize: 22, marginBottom: 12 }}>
                {icon} {post.maturity}
              </p>
            )}
            <h1
              style={{
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 48px)",
                lineHeight: 1.15,
                color: INK,
                marginBottom: 16,
              }}
            >
              {post.nombre}
            </h1>
            {post.date && (
              <p style={{ fontSize: 13, color: TERRACOTA, marginBottom: 16 }}>
                {fmtDate(post.date)}
              </p>
            )}
            {post.temas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {post.temas.map((t) => (
                  <span key={t} className="px-2 py-0.5 text-xs" style={{ border: `0.5px solid ${TERRACOTA}`, color: TERRACOTA }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {post.excerpt && (
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, marginBottom: 40 }}>{post.excerpt}</p>
            )}
            <div>{renderBlocks(post.blocks || [])}</div>

            <div className="mt-16">
              <Link
                to="/jardin"
                className="inline-block px-5 py-2.5 text-sm transition-colors"
                style={{ border: `1px solid ${TERRACOTA}`, color: TERRACOTA }}
              >
                ← Volver al jardín
              </Link>
            </div>
            </div>
          </>
        )}
      </article>
    </div>
  );
};

export default GardenPost;
