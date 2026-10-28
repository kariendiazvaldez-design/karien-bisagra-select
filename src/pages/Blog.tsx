import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

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

const CAT_COLOR: Record<string, string> = {
  "Service Design": "#6B7A3E",
  "Research": "#4A6580",
  "Diseño": "#C49A2A",
  "Tecnología": "#B5603A",
  "Educación": "#7B2D3E",
};
const getCatColor = (c: string) => CAT_COLOR[c] ?? "#888888";

const PAGE_SIZE = 10;

const Blog = () => {
  const [posts, setPosts] = useState<NotionPost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTipo, setActiveTipo] = useState("Todos");
  const [activeCat, setActiveCat] = useState("Todos");
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [activeTipo, activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const renderFilterBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className="px-4 py-2 text-sm transition-colors whitespace-nowrap"
      style={{
        border: "1px solid #6B7A3E",
        backgroundColor: active ? "#6B7A3E" : "transparent",
        color: active ? "#FFFFFF" : "#6B7A3E",
      }}
    >
      {label}
    </button>
  );

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      <Seo
        title="Blog — Karien Díaz Valdez"
        description="Blog de Karien Díaz Valdez sobre diseño de servicios, investigación, facilitación, aprendizaje y transformación digital."
        path="/blog"
      />
      <nav
        className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium">Karien.xyz</Link>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/lado-b" className="text-a-accent-soft hover:text-a-accent">Lado B</Link>
          </div>
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
          Cuaderno de campo:
        </h1>
        <p style={{ fontSize: 16, color: "#666", marginBottom: 40 }}>
          Notas para no olvidar, mientras exploro temas afines.
        </p>

        <div className="blog-filter-row mb-3">
          {TIPOS.map((t) => renderFilterBtn(t, activeTipo === t, () => setActiveTipo(t)))}
        </div>
        <div className="blog-filter-row mb-10">
          {categories.map((c) => renderFilterBtn(c, activeCat === c, () => setActiveCat(c)))}
        </div>

        {loading ? (
          <div className="blog-masonry">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  breakInside: "avoid",
                  background: "#FFFFFF",
                  border: "0.5px solid #E8E8E8",
                  borderRadius: 10,
                  overflow: "hidden",
                  marginBottom: 20,
                }}
              >
                <div style={{ height: 3, background: "#E8E8E8" }} />
                <div style={{ padding: 20 }}>
                  <div className="h-3 w-20 bg-[#E8E8E8] mb-3" />
                  <div className="h-4 w-3/4 bg-[#E8E8E8] mb-3" />
                  <div className="h-3 w-full bg-[#E8E8E8] mb-2" />
                  <div className="h-3 w-5/6 bg-[#E8E8E8]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Sin entradas para esta combinación
          </p>
        ) : (
          <div className="blog-masonry">
            {paginated.map((post) => {
              const accent = getCatColor(post.category);
              const formattedDate =
                post.date && post.date.includes("-")
                  ? new Date(post.date).toLocaleDateString("es-ES", { year: "numeric", month: "long" })
                  : post.date;
              const inner = (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "0.5px solid #E8E8E8",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: 3, background: accent }} />
                  <div style={{ padding: 20 }}>
                    {post.tipo && (
                      <p
                        className="uppercase"
                        style={{
                          fontFamily: "Lexend, sans-serif",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          color: "#aaa",
                          marginBottom: 4,
                        }}
                      >
                        {post.tipo}
                      </p>
                    )}
                    {post.category && (
                      <p
                        className="uppercase"
                        style={{
                          fontFamily: "Lexend, sans-serif",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          fontWeight: 600,
                          color: accent,
                          marginBottom: 10,
                        }}
                      >
                        {post.category}
                      </p>
                    )}
                    <h3
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#1A1A1A",
                        lineHeight: 1.4,
                        marginBottom: 10,
                      }}
                    >
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#777",
                          lineHeight: 1.7,
                          marginBottom: 16,
                        }}
                      >
                        {post.excerpt}
                      </p>
                    )}
                    <div
                      className="flex items-center justify-between"
                      style={{ fontSize: 11 }}
                    >
                      <span style={{ color: "#aaa" }}>{formattedDate}</span>
                      <span style={{ color: accent }}>Leer →</span>
                    </div>
                  </div>
                </div>
              );
              const wrapperStyle: React.CSSProperties = {
                breakInside: "avoid",
                display: "block",
                marginBottom: 20,
              };
              return post.slug ? (
                <Link key={post.id} to={`/blog/${post.slug}`} style={wrapperStyle}>
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

        {!loading && filtered.length > 0 && totalPages > 1 && (
          <>
            {/* Paginación desktop */}
            <nav className="blog-pagination-desktop flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  color: "#6B7A3E",
                  background: "transparent",
                  opacity: currentPage === 1 ? 0.4 : 1,
                }}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const active = p === currentPage;
                return (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 4,
                      background: active ? "#6B7A3E" : "transparent",
                      color: active ? "#FFFFFF" : "#6B7A3E",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  color: "#6B7A3E",
                  background: "transparent",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                }}
              >
                →
              </button>
            </nav>

            {/* Paginación mobile */}
            <nav className="blog-pagination-mobile flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  color: "#6B7A3E",
                  background: "transparent",
                  opacity: currentPage === 1 ? 0.4 : 1,
                }}
              >
                ←
              </button>
              <span style={{ color: "#6B7A3E", fontSize: 14 }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  color: "#6B7A3E",
                  background: "transparent",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                }}
              >
                →
              </button>
            </nav>
          </>
        )}

        {/* Footer con identidad */}
        <footer
          className="blog-identity-footer mt-16"
          style={{
            borderTop: "1px solid #E8E8E8",
            background: "#FAFAF7",
            padding: "48px 24px",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          <div
            className="blog-identity-inner mx-auto"
            style={{ maxWidth: 1100, display: "flex", alignItems: "center", gap: 32 }}
          >
            <img
              className="blog-identity-photo"
              src="https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1777913217/1_kmkeqj.png"
              alt="Karien Díaz"
              style={{ width: 64, height: 64, borderRadius: 8, flexShrink: 0, objectFit: "cover" }}
            />
            <div className="blog-identity-text" style={{ flex: 1 }}>
              <p style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, fontSize: 15, color: "#1A1A1A", marginBottom: 6 }}>
                Karien Díaz
              </p>
              <p style={{ fontFamily: "Lexend, sans-serif", fontSize: 13, color: "#666", lineHeight: 1.7, maxWidth: 400 }}>
                Diseñadora de servicios y comunicadora. Trabajo en la intersección entre personas, procesos y tecnología, con organizaciones que quieren que las cosas funcionen mejor para quienes las usan.
              </p>
            </div>
            <div
              className="blog-identity-ctas"
              style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}
            >
              <Link
                to="/#proyectos"
                style={{
                  fontFamily: "Lexend, sans-serif",
                  fontSize: 13,
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "#6B7A3E",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                Ver portafolio →
              </Link>
              <a
                href={"https://wa.me/51927822614?text=" + encodeURIComponent("Hola, vengo de tu web!")}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "Lexend, sans-serif",
                  fontSize: 13,
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "1px solid #6B7A3E",
                  color: "#6B7A3E",
                  textAlign: "center",
                }}
              >
                ¿Trabajamos juntxs? →
              </a>
            </div>
          </div>
        </footer>

        <style>{`
          .blog-masonry { column-count: 1; column-gap: 20px; }
          @media (min-width: 640px) { .blog-masonry { column-count: 2; } }
          @media (min-width: 1024px) { .blog-masonry { column-count: 3; } }

          .blog-filter-row {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            flex-wrap: nowrap;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .blog-filter-row::-webkit-scrollbar { display: none; }

          .blog-pagination-mobile { display: none; }
          @media (max-width: 639px) {
            .blog-pagination-desktop { display: none; }
            .blog-pagination-mobile { display: flex; }
          }

          .blog-mini-footer-inner { gap: 12px; flex-direction: row; }
          @media (max-width: 639px) {
            .blog-mini-footer-inner { flex-direction: column; gap: 12px; }
            .blog-mini-footer-sep { display: none; }
            .blog-identity-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
            .blog-identity-ctas { width: 100%; }
          }
        `}</style>
      </section>
    </div>
  );
};

export default Blog;
