import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

type RichText = { plain_text: string; href?: string | null; annotations?: any };
type Block = { id: string; type: string; [k: string]: any };
type Post = {
  id: string;
  nombre: string;
  category: string;
  date: string;
  excerpt: string;
  maturity: string;
  temas: string[];
  tipo: string;
  blocks: Block[];
};

const TERRACOTA = "#C4622D";
const BG = "#FAFAF8";
const INK = "#1C1A17";
const BORDER_FAINT = "0.5px solid rgba(28, 26, 23, 0.15)";

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
      let el: React.ReactNode = t.plain_text;
      if (a.code) el = <code key={i} className="px-1 py-0.5 bg-[#F3EDE6] text-[0.9em]">{el}</code>;
      const style: React.CSSProperties = {
        fontWeight: a.bold ? 600 : undefined,
        fontStyle: a.italic ? "italic" : undefined,
        textDecoration: [a.underline && "underline", a.strikethrough && "line-through"].filter(Boolean).join(" ") || undefined,
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

const renderBlocks = (blocks: Block[]) => {
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
              <li key={it.id} style={{ marginBottom: 6, fontSize: 15, lineHeight: 1.8 }}>
                <span style={{ color: INK }}>
                  <RT rich={d.rich_text || []} />
                </span>
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
          <p key={b.id} className="font-quicksand" style={{ fontSize: 15, lineHeight: 1.8, color: INK, marginBottom: 16 }}>
            <RT rich={data.rich_text || []} />
          </p>,
        );
        break;
      case "heading_1":
        out.push(
          <h1 key={b.id} className="font-quicksand" style={{ fontWeight: 700, fontSize: 32, color: TERRACOTA, marginTop: 32, marginBottom: 16, letterSpacing: "-0.01em" }}>
            <RT rich={data.rich_text || []} />
          </h1>,
        );
        break;
      case "heading_2":
        out.push(
          <h2 key={b.id} className="font-quicksand" style={{ fontWeight: 700, fontSize: 22, color: TERRACOTA, marginTop: 28, marginBottom: 12 }}>
            <RT rich={data.rich_text || []} />
          </h2>,
        );
        break;
      case "heading_3":
        out.push(
          <h3 key={b.id} className="font-quicksand" style={{ fontWeight: 600, fontSize: 18, color: INK, marginTop: 24, marginBottom: 10 }}>
            <RT rich={data.rich_text || []} />
          </h3>,
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
          </blockquote>,
        );
        break;
      case "image": {
        const src = data.type === "external" ? data.external?.url : data.file?.url;
        const caption = (data.caption || []).map((c: RichText) => c.plain_text).join("");
        out.push(
          <figure key={b.id} style={{ margin: "24px 0" }}>
            {src && <img src={src} alt={caption || ""} className="w-full" />}
            {caption && (
              <figcaption style={{ fontSize: 13, color: "#999", textAlign: "center", marginTop: 8 }}>{caption}</figcaption>
            )}
          </figure>,
        );
        break;
      }
      case "divider":
        out.push(<hr key={b.id} style={{ border: 0, borderTop: "1px solid #E8E8E8", margin: "24px 0" }} />);
        break;
      default:
        if (data?.rich_text) {
          out.push(
            <p key={b.id} className="font-quicksand" style={{ fontSize: 15, lineHeight: 1.8, color: INK, marginBottom: 16 }}>
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

      <article className="mx-auto px-6 md:px-8 pt-32 pb-24" style={{ maxWidth: 680 }}>
        {loading ? (
          <div className="animate-pulse">
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
          </>
        )}
      </article>
    </div>
  );
};

export default GardenPost;
