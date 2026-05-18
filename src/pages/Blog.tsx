import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type NotionPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tipo: string;
  excerpt: string;
  date: string;
};

const TIPOS = ["Todos", "Blog", "Reseñas", "Apuntes"];

const Blog = () => {
  const [posts, setPosts] = useState<NotionPost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTipo, setActiveTipo] = useState("Todos");
  const [activeCat, setActiveCat] = useState("Todos");

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke("get-blog-posts", { method: "POST" })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("get-blog-posts error", error);
          setPosts([]);
        } else {
          setPosts(Array.isArray(data?.posts) ? data.posts : []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (posts || []).forEach((p) => p.category && set.add(p.category));
    return ["Todos", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts.filter((p) => {
      const tipoOk = activeTipo === "Todos" || p.tipo === activeTipo;
      const catOk = activeCat === "Todos" || p.category === activeCat;
      return tipoOk && catOk;
    });
  }, [posts, activeTipo, activeCat]);

  const renderFilterBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className="px-4 py-2 text-sm transition-colors"
      style={{
        border: "1px solid #6B7A3E",
        backgroundColor: active ? "#6B7A3E" : "transparent",
        color: active ? "#FFFFFF" : "#6B7A3E",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      <nav
        className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/lado-a" className="font-medium">← Karien.xyz</Link>
          <Link to="/lado-b" className="text-sm text-a-accent-soft hover:text-a-accent">Lado B →</Link>
        </div>
      </nav>

      <section className="px-6 md:px-20 pt-32 pb-24 max-w-6xl mx-auto">
        <h1
          style={{
            fontFamily: "Lexend, sans-serif",
            fontWeight: 700,
            fontSize: 48,
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          Blog
        </h1>
        <p style={{ fontSize: 16, color: "#666", marginBottom: 40 }}>
          Apuntes, reseñas y reflexiones
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {TIPOS.map((t) => renderFilterBtn(t, activeTipo === t, () => setActiveTipo(t)))}
        </div>
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((c) => renderFilterBtn(c, activeCat === c, () => setActiveCat(c)))}
        </div>

        {loading ? (
          <div style={{ columnCount: 3, columnGap: 24 }} className="masonry-loading">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  breakInside: "avoid",
                  marginBottom: 24,
                  paddingBottom: 24,
                  borderBottom: "1px solid #E8E8E8",
                }}
              >
                <div className="h-3 w-20 bg-[#E8E8E8] mb-3" />
                <div className="h-4 w-3/4 bg-[#E8E8E8] mb-3" />
                <div className="h-3 w-full bg-[#E8E8E8] mb-2" />
                <div className="h-3 w-5/6 bg-[#E8E8E8] mb-2" />
                <div className="h-3 w-20 bg-[#E8E8E8]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Sin entradas para esta combinación
          </p>
        ) : (
          <div className="blog-masonry">
            {filtered.map((post) => {
              const inner = (
                <>
                  {post.tipo && (
                    <p
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#999",
                        marginBottom: 4,
                      }}
                    >
                      {post.tipo}
                    </p>
                  )}
                  {post.category && (
                    <p
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#6B7A3E",
                        marginBottom: 8,
                      }}
                    >
                      {post.category}
                    </p>
                  )}
                  <h3
                    style={{
                      fontFamily: "Lexend, sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#1A1A1A",
                      lineHeight: 1.3,
                      marginBottom: 10,
                    }}
                  >
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontSize: 14,
                        color: "#555",
                        lineHeight: 1.55,
                        marginBottom: 12,
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}
                  {post.date && (
                    <p style={{ fontSize: 13, color: "#6B7A3E" }}>
                      {post.date.includes("-")
                        ? new Date(post.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                          })
                        : post.date}
                    </p>
                  )}
                </>
              );
              const wrapperStyle: React.CSSProperties = {
                breakInside: "avoid",
                display: "block",
                marginBottom: 24,
                paddingBottom: 24,
                borderBottom: "1px solid #E8E8E8",
              };
              return post.slug ? (
                <Link key={post.id} to={`/lado-a/blog/${post.slug}`} style={wrapperStyle}>
                  {inner}
                </Link>
              ) : (
                <article key={post.id} style={wrapperStyle}>
                  {inner}
                </article>
              );
            })}
          </div>
        )}

        <style>{`
          .blog-masonry { column-count: 1; column-gap: 24px; }
          @media (min-width: 640px) { .blog-masonry { column-count: 2; } }
          @media (min-width: 1024px) { .blog-masonry { column-count: 3; } }
        `}</style>
      </section>
    </div>
  );
};

export default Blog;
