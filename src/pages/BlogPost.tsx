import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type RichText = { plain_text: string; href?: string | null; annotations?: any };
type Block = { id: string; type: string; [k: string]: any };
type Post = {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  tipo: string;
  blocks: Block[];
};

const OLIVE = "#6B7A3E";

const RT = ({ rich }: { rich: RichText[] }) => (
  <>
    {(rich || []).map((t, i) => {
      const a = t.annotations || {};
      let el: React.ReactNode = t.plain_text;
      if (a.code) el = <code key={i} className="px-1 py-0.5 bg-[#F3F4EE] text-[0.9em]">{el}</code>;
      const style: React.CSSProperties = {
        fontWeight: a.bold ? 600 : undefined,
        fontStyle: a.italic ? "italic" : undefined,
        textDecoration: [a.underline && "underline", a.strikethrough && "line-through"].filter(Boolean).join(" ") || undefined,
        color: a.color && a.color !== "default" ? undefined : undefined,
      };
      const node = <span key={i} style={style}>{el}</span>;
      return t.href ? (
        <a key={i} href={t.href} target="_blank" rel="noreferrer" style={{ color: OLIVE, textDecoration: "underline" }}>
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
            color: OLIVE,
          }}
        >
          {items.map((it) => {
            const d = it[it.type];
            return (
              <li key={it.id} style={{ marginBottom: 6, fontSize: 15, lineHeight: 1.8 }}>
                <span style={{ color: "#1A1A1A" }}>
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
          <p key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontSize: 15, lineHeight: 1.8, color: "#1A1A1A", marginBottom: 16 }}>
            <RT rich={data.rich_text || []} />
          </p>,
        );
        break;
      case "heading_1":
        out.push(
          <h1 key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, fontSize: 32, color: OLIVE, marginTop: 32, marginBottom: 16, letterSpacing: "-0.02em" }}>
            <RT rich={data.rich_text || []} />
          </h1>,
        );
        break;
      case "heading_2":
        out.push(
          <h2 key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, fontSize: 22, color: OLIVE, marginTop: 28, marginBottom: 12 }}>
            <RT rich={data.rich_text || []} />
          </h2>,
        );
        break;
      case "heading_3":
        out.push(
          <h3 key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontWeight: 600, fontSize: 18, color: "#1A1A1A", marginTop: 24, marginBottom: 10 }}>
            <RT rich={data.rich_text || []} />
          </h3>,
        );
        break;
      case "quote":
        out.push(
          <blockquote
            key={b.id}
            style={{
              borderLeft: `3px solid ${OLIVE}`,
              background: "#F3F4EE",
              padding: "14px 18px",
              margin: "20px 0",
              fontStyle: "italic",
              fontSize: 15,
              lineHeight: 1.7,
              color: "#1A1A1A",
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
              <figcaption style={{ fontSize: 13, color: "#666", textAlign: "center", marginTop: 8 }}>{caption}</figcaption>
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
            <p key={b.id} style={{ fontFamily: "Lexend, sans-serif", fontSize: 15, lineHeight: 1.8, color: "#1A1A1A", marginBottom: 16 }}>
              <RT rich={data.rich_text} />
            </p>,
          );
        }
    }
    i++;
  }
  return out;
};

const BlogPost = () => {
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
      .invoke("get-blog-post-by-slug", { body: { slug } })
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

  return (
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]" style={{ borderBottomWidth: "0.5px" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/lado-a" className="font-medium">← Karien.xyz</Link>
          <Link to="/lado-b" className="text-sm text-a-accent-soft hover:text-a-accent">Lado B →</Link>
        </div>
      </nav>

      <article className="mx-auto px-6 md:px-8 pt-32 pb-24" style={{ maxWidth: 680 }}>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-3 w-24 bg-[#E8E8E8] mb-4" />
            <div className="h-10 w-full bg-[#E8E8E8] mb-4" />
            <div className="h-10 w-3/4 bg-[#E8E8E8] mb-8" />
            <div className="h-3 w-32 bg-[#E8E8E8] mb-10" />
            <div className="h-4 w-full bg-[#E8E8E8] mb-3" />
            <div className="h-4 w-full bg-[#E8E8E8] mb-3" />
            <div className="h-4 w-5/6 bg-[#E8E8E8]" />
          </div>
        ) : error || !post ? (
          <p className="text-center text-muted-foreground py-16">Entrada no encontrada</p>
        ) : (
          <>
            {post.category && (
              <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: OLIVE, fontWeight: 500, marginBottom: 16 }}>
                {post.category}
              </p>
            )}
            <h1 style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#1A1A1A", marginBottom: 16 }}>
              {post.title}
            </h1>
            {post.date && (
              <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>
                {new Date(post.date).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
            {post.excerpt && (
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, marginBottom: 40 }}>{post.excerpt}</p>
            )}
            <div>{renderBlocks(post.blocks || [])}</div>

            <div className="mt-16">
              <Link
                to="/blog"
                className="inline-block px-5 py-2.5 text-sm transition-colors"
                style={{ border: `1px solid ${OLIVE}`, color: OLIVE }}
              >
                ← Volver al blog
              </Link>
            </div>
          </>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
