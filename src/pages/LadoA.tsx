import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { sanityClient } from "@/lib/sanityClient";
import { CASE_STUDIES_QUERY, BLOG_POSTS_QUERY } from "@/lib/sanityQueries";
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

const NAV_LINKS: { label: string; href: string; to?: string }[] = [
  { label: "Proyectos", href: "#proyectos" },
  { label: "Blog", href: "#blog" },
  { label: "Sobre mí", href: "#sobre-mi" },
];

const WHATSAPP_URL =
  "https://wa.me/51927822614?text=" + encodeURIComponent("Hola, vengo de tu web!");

const SKILLS = [
  "Diseño de servicios",
  "Investigación HCD",
  "Facilitación",
  "Arquitectura de información",
  "Project Management",
];

const HOVER_IMG_1 = "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1777913217/1_kmkeqj.png";
const HOVER_IMG_2 = "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1777913305/3_hjsqos.png";
const HOVER_IMG_3 = "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1777913304/2_brm4jt.png";

// Categoría → {text, bg}
const CAT_COLORS: Record<string, { text: string; bg: string }> = {
  Tecnología: { text: "#0F2A45", bg: "#D8E8F2" },
  Tecnologia: { text: "#0F2A45", bg: "#D8E8F2" },
  "Transformación Digital": { text: "#0F2A45", bg: "#D8E8F2" },
  Research: { text: "#3A1248", bg: "#EAD8F4" },
  "UX Research": { text: "#3A1248", bg: "#EAD8F4" },
  Diseño: { text: "#6A1A08", bg: "#F4D8D0" },
  "Service Design": { text: "#6A1A08", bg: "#F4D8D0" },
  "Diseño de servicios": { text: "#6A1A08", bg: "#F4D8D0" },
  Aprendizaje: { text: "#5A3E00", bg: "#F2E8C0" },
  Educación: { text: "#5A3E00", bg: "#F2E8C0" },
  "Diseño x Aprendizaje": { text: "#5A3E00", bg: "#F2E8C0" },
};
const getCat = (c: string) => CAT_COLORS[c] ?? { text: "#3D6B1F", bg: "#EDF4E2" };

const HoverWord = ({
  children,
  src,
  onHover,
}: {
  children: React.ReactNode;
  src: string;
  onHover: (src: string | null, x?: number, y?: number) => void;
}) => (
  <span
    onMouseEnter={() => onHover(src)}
    onMouseLeave={() => onHover(null)}
    onClick={(e) => {
      e.preventDefault();
      onHover(src, e.clientX, e.clientY);
      window.setTimeout(() => onHover(null), 2000);
    }}
    className="cursor-pointer"
    style={{
      textDecoration: "underline dotted",
      textDecorationColor: "rgba(232,184,32,0.6)",
      textUnderlineOffset: "4px",
    }}
  >
    {children}
  </span>
);

const LadoA = () => {
  const [hoverImg, setHoverImg] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [activeCat, setActiveCat] = useState("Todos");
  const [activeTipo, setActiveTipo] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const handleHover = (src: string | null, x?: number, y?: number) => {
    if (src && typeof x === "number" && typeof y === "number") setCursor({ x, y });
    setHoverImg(src);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const [, setSanityProjects] = useState<any[] | null>(null);
  const [, setSanityPosts] = useState<any[] | null>(null);
  useEffect(() => {
    sanityClient.fetch(CASE_STUDIES_QUERY).then((res) => {
      if (Array.isArray(res) && res.length > 0) setSanityProjects(res);
    }).catch(() => {});
    sanityClient.fetch(BLOG_POSTS_QUERY).then((res) => {
      if (Array.isArray(res) && res.length > 0) setSanityPosts(res);
    }).catch(() => {});
  }, []);

  const [notionPosts, setNotionPosts] = useState<NotionPost[] | null>(null);
  const [notionLoading, setNotionLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke("get-blog-posts", { method: "POST" })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("get-blog-posts error", error);
          setNotionPosts([]);
        } else {
          setNotionPosts(Array.isArray(data?.posts) ? data.posts : []);
        }
      })
      .finally(() => {
        if (!cancelled) setNotionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    (notionPosts || []).forEach((p) => p.category && set.add(p.category));
    return ["Todos", ...Array.from(set)];
  }, [notionPosts]);

  const dynamicTipos = useMemo(() => {
    const set = new Set<string>();
    (notionPosts || []).forEach((p) => p.tipo && set.add(p.tipo));
    return ["Todos", ...Array.from(set)];
  }, [notionPosts]);

  const filteredPosts = useMemo(() => {
    if (!notionPosts) return [];
    return notionPosts.filter((p) => {
      const catOk = activeCat === "Todos" || p.category === activeCat;
      const tipoOk = activeTipo === "Todos" || p.tipo === activeTipo;
      return catOk && tipoOk;
    });
  }, [notionPosts, activeCat, activeTipo]);

  const scrollToProjects = () => {
    document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lado-a min-h-screen">
      {/* NAV */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div
          className="max-w-6xl mx-auto px-5 md:px-7 h-14 flex items-center justify-between"
          style={{
            background: "#2A4F10",
            borderRadius: 16,
          }}
        >
          <Link to="/" style={{ color: "#F5F0E0", fontWeight: 700, fontSize: 15 }}>
            Karien.xyz
          </Link>
          <div className="hidden md:flex gap-7" style={{ fontSize: 13 }}>
            {NAV_LINKS.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{ color: "rgba(245,240,224,0.75)" }}
                  className="hover:!text-[#F5F0E0] transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  style={{ color: "rgba(245,240,224,0.75)" }}
                  className="hover:!text-[#F5F0E0] transition-colors"
                >
                  {l.label}
                </a>
              )
            )}
          </div>
          <Link
            to="/lado-b"
            className="hidden md:inline-flex items-center"
            style={{
              color: "#E8B820",
              border: "0.5px solid rgba(232,184,32,0.5)",
              borderRadius: 50,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Lado B →
          </Link>
          <button
            className="md:hidden text-xl"
            style={{ color: "#F5F0E0" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            ···
          </button>
        </div>
        {menuOpen && (
          <div
            className="md:hidden mt-2 px-5 py-4 flex flex-col gap-3 max-w-6xl mx-auto"
            style={{ background: "#2A4F10", borderRadius: 16 }}
          >
            {NAV_LINKS.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "rgba(245,240,224,0.85)", fontSize: 14 }}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "rgba(245,240,224,0.85)", fontSize: 14 }}
                >
                  {l.label}
                </a>
              )
            )}
            <Link to="/lado-b" style={{ color: "#E8B820", fontSize: 14 }}>
              Lado B →
            </Link>
          </div>
        )}
      </nav>

      {/* Floating hover image */}
      {hoverImg && (
        <img
          src={hoverImg}
          alt=""
          className="fixed pointer-events-none z-50 transition-opacity duration-300"
          style={{
            left: Math.min(cursor.x + 24, (typeof window !== "undefined" ? window.innerWidth : 1000) - 240),
            top: Math.min(cursor.y + 24, (typeof window !== "undefined" ? window.innerHeight : 800) - 240),
            width: 220,
            height: "auto",
            borderRadius: 16,
            opacity: 1,
          }}
        />
      )}

      <div className="pt-24 px-4 md:px-6 pb-6" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* HERO */}
        <section className="ds-hero-bg max-w-6xl w-full mx-auto px-6 md:px-16 py-20 md:py-28 text-center">
          <div className="relative max-w-[720px] mx-auto">
            <p className="ds-eyebrow mb-6">Diseño de servicios · Transformación digital</p>
            <h1
              style={{
                fontSize: "clamp(38px, 6vw, 48px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                marginBottom: 24,
              }}
            >
              <span style={{ color: "#F5F0E0", fontWeight: 700, display: "block" }}>
                Entender mejor
              </span>
              <span style={{ color: "#E8B820", fontWeight: 300, display: "block" }}>
                para diseñar mejor.
              </span>
            </h1>
            <p
              className="mx-auto mb-10 whitespace-pre-line"
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: 15,
                fontWeight: 300,
                lineHeight: 1.7,
                maxWidth: 580,
              }}
            >
              <HoverWord src={HOVER_IMG_3} onHover={handleHover}><span style={{ color: "#FFFFFF", fontWeight: 700 }}>Comunicadora</span></HoverWord> de formación,{" "}
              <HoverWord src={HOVER_IMG_1} onHover={handleHover}>
                <span style={{ color: "#FFFFFF", fontWeight: 700 }}>diseñadora de servicios</span>
              </HoverWord>{" "}
              en la práctica. Trabajo en la intersección entre investigación, facilitación y diseño con{" "}
              <HoverWord src={HOVER_IMG_2} onHover={handleHover}><span style={{ color: "#FFFFFF", fontWeight: 700 }}>equipos</span></HoverWord> que quieren profundizar antes de actuar.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={scrollToProjects} className="ds-btn ds-btn-primary">
                Ver proyectos →
              </button>
              <a href="#contacto" className="ds-btn ds-btn-ghost-cream">
                ¿Trabajamos juntxs?
              </a>
            </div>
          </div>
        </section>

        {/* AHORA MISMO */}
        <section className="max-w-6xl w-full mx-auto ds-card px-6 md:px-12 py-12 md:py-14">
          <div className="max-w-[860px] mx-auto">
            <h2
              className="ds-section-title mb-8"
              style={{ textAlign: "left" }}
            >
              Ahora mismo <span style={{ color: "#C94A20" }}>estoy —</span>
            </h2>
            {(() => {
              const NOW_CARDS = [
                {
                  context: "Diseño de servicios",
                  text: "Diseñando servicios con BioActiva, un hub de innovación en I+D+i.",
                  accent: "#7AAA40",
                  linkLabel: "Leer en el blog →",
                  matchCats: ["Diseño de servicios", "Service Design", "Diseño"],
                },
                {
                  context: "Research",
                  text: "Investigando cómo unir al museo más antiguo de Lambayeque con transformación digital.",
                  accent: "#C94A20",
                  linkLabel: "Ver investigación →",
                  matchCats: ["Research", "UX Research", "Transformación Digital", "Tecnología", "Tecnologia"],
                },
                {
                  context: "Aprendizaje",
                  text: "Aprendiendo sobre diseño desde el team de Command Z Podcast.",
                  accent: "#E8B820",
                  linkLabel: "Notas de aprendizaje →",
                  matchCats: ["Aprendizaje", "Educación", "Diseño x Aprendizaje"],
                },
                {
                  context: "Comunidad",
                  text: "Conectando miradas desde Sur Global y su revista Untold.ink.",
                  accent: "#3D6B1F",
                  linkLabel: "Explorar comunidad →",
                  matchCats: ["Comunidad", "Sur Global"],
                },
              ];

              const findPost = (cats: string[]) => {
                if (!notionPosts) return null;
                return notionPosts.find((p) => cats.includes(p.category)) || null;
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {NOW_CARDS.map((card, i) => {
                    const post = findPost(card.matchCats);
                    const href = post ? `/blog/${post.slug}` : "#blog";
                    return (
                      <div key={i} className="ds-card" style={{ padding: "1.5rem 1.4rem 1.4rem", display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="ds-card-line" style={{ background: card.accent }} />
                        <span
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "#7A8060",
                            fontWeight: 500,
                          }}
                        >
                          {card.context}
                        </span>
                        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.55, color: "#4A4A3A", flex: 1 }}>
                          {card.text}
                        </p>
                        <Link
                          to={href}
                          className="ds-pill"
                          style={{
                            alignSelf: "flex-start",
                            background: "transparent",
                            border: `0.5px solid ${card.accent}`,
                            color: card.accent,
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "6px 14px",
                          }}
                        >
                          {card.linkLabel}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="flex flex-wrap items-center mt-8" style={{ gap: 10 }}>
              <button onClick={scrollToProjects} className="ds-btn ds-btn-terracota">
                Portafolio →
              </button>
              <a href="#contacto" className="ds-btn ds-btn-outline">
                ¿Conversemos? →
              </a>
              <Link to="/blog" className="ds-btn ds-btn-outline">
                Al blog →
              </Link>
            </div>
          </div>
        </section>


        {/* BLOG */}
        <section id="blog" className="max-w-6xl w-full mx-auto px-2 md:px-4 py-10">
          <p className="ds-eyebrow mb-3" style={{ color: "#3D6B1F" }}>Aprendizajes</p>
          <h2 className="ds-section-title mb-8">Actualmente curioseando:</h2>

          <div className="mb-4">
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#9A9A8A", textTransform: "uppercase", marginBottom: 8 }}>
              Temas
            </p>
            <div className="flex flex-wrap gap-2">
              {dynamicCategories.map((cat) => {
                const active = activeCat === cat;
                const colors = cat === "Todos" ? { text: "#3D6B1F", bg: "#EDF4E2" } : getCat(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className="ds-pill"
                    style={{
                      background: active ? colors.text : colors.bg,
                      color: active ? "#FFFFFF" : colors.text,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-10">
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#9A9A8A", textTransform: "uppercase", marginBottom: 8 }}>
              Formato
            </p>
            <div className="flex flex-wrap gap-2">
              {dynamicTipos.map((t) => {
                const active = activeTipo === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTipo(t)}
                    className="ds-pill"
                    style={{
                      background: active ? "#3D6B1F" : "transparent",
                      color: active ? "#FFFFFF" : "#3D6B1F",
                      border: "0.5px solid #D4CDB0",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const limitedPosts = filteredPosts.slice(0, 4);
            if (notionLoading) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="ds-card animate-pulse" style={{ padding: 0 }}>
                      <div className="ds-card-line" style={{ background: "#E8E8E0" }} />
                      <div style={{ padding: 24 }}>
                        <div className="h-3 w-24 bg-[#EDF4E2] mb-3" />
                        <div className="h-4 w-3/4 bg-[#EDF4E2] mb-3" />
                        <div className="h-3 w-full bg-[#EDF4E2] mb-2" />
                        <div className="h-3 w-5/6 bg-[#EDF4E2]" />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            if (limitedPosts.length === 0) {
              return <p className="text-center py-12" style={{ color: "#7A8060" }}>Nada publicado aún</p>;
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {limitedPosts.map((post) => {
                  const colors = getCat(post.category);
                  const formattedDate =
                    post.date && post.date.includes("-")
                      ? new Date(post.date).toLocaleDateString("es-ES", { year: "numeric", month: "long" })
                      : post.date;
                  const inner = (
                    <div className="ds-card h-full flex flex-col">
                      <div className="ds-card-line" style={{ background: colors.text }} />
                      <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
                        <span
                          className="ds-pill mb-3"
                          style={{ background: colors.bg, color: colors.text, alignSelf: "flex-start" }}
                        >
                          {post.category}
                        </span>
                        <h3 style={{ fontSize: 17, fontWeight: 500, color: "#1A1F0A", lineHeight: 1.35, marginBottom: 10 }}>
                          {post.title}
                        </h3>
                        <p
                          style={{
                            fontSize: 14, color: "#5A5A4A", fontWeight: 300, lineHeight: 1.65,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            overflow: "hidden", marginBottom: 16,
                          }}
                        >
                          {post.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between" style={{ fontSize: 11 }}>
                          <span style={{ color: "#9A9A8A" }}>{formattedDate}</span>
                          <span style={{ color: "#3D6B1F", fontWeight: 500 }}>Leer →</span>
                        </div>
                      </div>
                    </div>
                  );
                  return post.slug ? (
                    <Link key={post.id} to={`/blog/${post.slug}`}>{inner}</Link>
                  ) : (
                    <div key={post.id}>{inner}</div>
                  );
                })}
              </div>
            );
          })()}

          <div className="mt-10 text-center">
            <Link to="/blog" className="ds-btn ds-btn-outline">
              Ver más →
            </Link>
          </div>
        </section>

        {/* SOBRE MI */}
        <section id="sobre-mi" className="max-w-6xl w-full mx-auto ds-card px-6 md:px-12 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 order-2 md:order-1">
              <p className="ds-eyebrow mb-3" style={{ color: "#3D6B1F" }}>Sobre mí</p>
              <h2 className="ds-section-title mb-5">Karien:</h2>
              <p className="ds-body mb-4" style={{ maxWidth: 720 }}>
                Llegué al diseño de servicios desde la comunicación, y me quedé porque es una forma de entender cómo las personas viven lo que las organizaciones construyen, y de hacer algo al respecto. Trabajo en el cruce entre investigación, facilitación y diseño, con equipos que están transitando cambios y buscan claridad para crear soluciones. He colaborado con programas educativos, en innovación corporativa y con comunidades en distintas regiones del Perú. Hoy me interesan los retos de mayor escala y complejidad sistémica: la intersección entre IA y diseño de servicios, el diseño ecosistémico, y el puente entre STEM (tecnología) y GLAM (museos).
              </p>
              {aboutExpanded && (
                <p className="ds-body mb-4" style={{ maxWidth: 720 }}>
                  Actualmente curso una maestría de Transformación Digital y desarrollo una tesis que explora cómo pasar de la digitación a la digitalización en el Museo Brüning de Lambayeque. Me formé en mediación cultural y eso sigue vivo. Manifiesto ir a la maestría SdSi en el futuro. Mientras tanto, trabajo en remoto y busco conocer el Perú mientras aprendo.
                </p>
              )}
              <button
                onClick={() => setAboutExpanded((v) => !v)}
                className="mb-6"
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  color: "#3D6B1F",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  cursor: "pointer",
                }}
              >
                {aboutExpanded ? "Leer menos" : "Leer más"}
              </button>
              <div className="flex flex-wrap gap-2 mb-7">
                {SKILLS.map((s) => (
                  <span key={s} className="ds-tag">{s}</span>
                ))}
              </div>
              <a
                href="https://docs.google.com/document/d/1DBVwPjFIQ-Zu9P8tTLyugaJP77exdsA2iA9CIyOFMtI/edit?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="ds-btn ds-btn-terracota"
              >
                Perfil profesional →
              </a>
            </div>
            <div className="order-1 md:order-2 flex-shrink-0 w-full md:w-auto" style={{ maxWidth: 360 }}>
              <img
                src={HOVER_IMG_1}
                alt="Karien"
                className="w-full object-cover h-[260px] md:h-auto"
                style={{ borderRadius: 20, background: "#EDF4E2" }}
              />
            </div>
          </div>
        </section>

        {/* PROYECTOS */}
        <section id="proyectos" className="max-w-6xl w-full mx-auto px-2 md:px-4 py-10">
          <p className="ds-eyebrow mb-3" style={{ color: "#3D6B1F" }}>Portafolio</p>
          <h2 className="ds-section-title mb-8">Proyectos:</h2>
          {(() => {
            const PROJECT_IMAGES: Record<string, string> = {
              "innova-plus": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1777913304/2_brm4jt.png",
              "command-z": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1779259677/Captura_de_pantalla_2026-05-20_012733_b5ntfl.png",
              "la-huaca": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1779303598/53364966_437290196813210_7415387592050343936_n_qibyj3.jpg",
            };

            type CardData = {
              id: string; category: string; title: string; scale: string; description: string;
            };

            const HERO: CardData = {
              id: "innova-plus",
              category: "Diseño de servicios · Innovación corporativa",
              title: "INNOVA+ 2025: programa de I+D+i para empresas",
              scale: "BioActiva · BID · 22 empresas · 84% asistencia · 4,2/5 satisfacción",
              description: "Rediseñé la experiencia completa de la segunda edición: blueprint, ciclo formativo, comunicación y rebranding. 22 empresas · 84% asistencia · 4,2/5 satisfacción · 20 hojas de ruta ejecutadas.",
            };

            const ROW1: CardData[] = [
              { id: "command-z", category: "Arquitectura de información · Producto digital",
                title: "Command Z: del podcast al sistema de aprendizaje",
                scale: "+150 episodios · 4 rutas · 3 perfiles",
                description: "Analicé y estructuré el archivo del podcast con Python y la API de Spotify. Diseñé una app no-code con rutas de aprendizaje en 3 niveles." },
              { id: "patria-c", category: "Diseño de servicios · Project management",
                title: "Patria C: academia ciudadana para jóvenes de todo el Perú",
                scale: "150 becarios · NPS 91% · permanencia 80%",
                description: "Diseñé y gestioné la experiencia end-to-end de un programa remoto para jóvenes líderes." },
            ];
            const ROW2: CardData[] = [
              { id: "washma", category: "Desarrollo comunitario · Project management",
                title: "WASHMA: mujeres kañaris tejiendo identidad",
                scale: "S/64,000 · 100% ejecución · 4 ediciones Ruraq Maki",
                description: "Formulé y gestioné un plan de negocio financiado por AgroRural–MIDAGRI tras 3 años de trabajar con la asociación." },
              { id: "la-huaca", category: "Gestión cultural · Project management",
                title: "La Huaca Independiente: festival en espacios patrimoniales",
                scale: "3 ediciones · +2,500 asistentes · 150 voluntarios",
                description: "Co-fundé y coordiné un festival cultural en espacios patrimoniales de Lambayeque." },
            ];

            const badge = (text: string) => (
              <span
                className="ds-pill"
                style={{ background: "#F4D8D0", color: "#6A1A08", alignSelf: "flex-start" }}
              >
                {text}
              </span>
            );

            const SmallCard = ({ c }: { c: CardData }) => (
              <Link to={`/portafolio/${c.id}`} className="ds-card group flex flex-col">
                <div
                  style={{
                    width: "100%",
                    height: 160,
                    background: "#EDF4E2",
                    overflow: "hidden",
                  }}
                >
                  {PROJECT_IMAGES[c.id] && (
                    <img src={PROJECT_IMAGES[c.id]} alt={c.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <p className="uppercase" style={{ fontSize: 10, color: "#C94A20", letterSpacing: "0.12em", fontWeight: 500 }}>
                    {c.category}
                  </p>
                  <h3 style={{ fontSize: 17, fontWeight: 500, color: "#1A1F0A", lineHeight: 1.3 }}>{c.title}</h3>
                  {badge(c.scale)}
                  <p style={{ fontSize: 13, color: "#5A5A4A", fontWeight: 300, lineHeight: 1.6 }}>{c.description}</p>
                  <span style={{ fontSize: 12, color: "#3D6B1F", fontWeight: 500, marginTop: "auto" }}>
                    Ver caso →
                  </span>
                </div>
              </Link>
            );

            return (
              <div className="flex flex-col gap-3">
                {/* Featured */}
                <Link
                  to={`/portafolio/${HERO.id}`}
                  className="group ds-hero-bg block"
                  style={{ padding: 0 }}
                >
                  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div
                      style={{
                        background: "linear-gradient(160deg, #1a3508 0%, #2a4f10 50%, #3d6b1f 100%)",
                        minHeight: 240,
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "1.75rem",
                      }}
                    >
                      <span
                        className="ds-pill"
                        style={{
                          background: "rgba(232,184,32,0.18)",
                          color: "#E8B820",
                          border: "0.5px solid rgba(232,184,32,0.45)",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        Featured · Diseño de servicios
                      </span>
                    </div>
                    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: 14 }}>
                      <p className="uppercase" style={{ fontSize: 10, color: "#E8B820", letterSpacing: "0.14em", fontWeight: 500 }}>
                        {HERO.category}
                      </p>
                      <h3 style={{ fontSize: 22, fontWeight: 700, color: "#F5F0E0", lineHeight: 1.25 }}>
                        {HERO.title}
                      </h3>
                      <span
                        className="ds-pill"
                        style={{
                          background: "rgba(232,184,32,0.15)",
                          color: "#E8B820",
                          border: "0.5px solid rgba(232,184,32,0.4)",
                          alignSelf: "flex-start",
                        }}
                      >
                        {HERO.scale}
                      </span>
                      <p style={{ fontSize: 14, color: "rgba(245,240,224,0.78)", fontWeight: 300, lineHeight: 1.65 }}>
                        {HERO.description}
                      </p>
                      <span style={{ fontSize: 13, color: "#E8B820", fontWeight: 500, marginTop: "auto" }}>
                        Ver caso →
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ROW1.map((c) => <SmallCard key={c.id} c={c} />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ROW2.map((c) => <SmallCard key={c.id} c={c} />)}
                </div>
              </div>
            );
          })()}
        </section>

        {/* CONTACTO */}
        <section
          id="contacto"
          className="ds-hero-bg max-w-6xl w-full mx-auto px-6 md:px-16 py-20 md:py-24 text-center"
        >
          <div className="relative max-w-3xl mx-auto">
            <p className="ds-eyebrow mb-4">Contacto</p>
            <h2
              style={{
                fontSize: "clamp(34px, 5vw, 44px)",
                fontWeight: 700,
                color: "#F5F0E0",
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              ¿Trabajemos juntxs?
            </h2>
            <p
              style={{
                color: "#E8B820",
                fontSize: 15,
                fontWeight: 300,
                marginBottom: 32,
                maxWidth: 540,
                margin: "0 auto 32px",
              }}
            >
              Interesada en proyectos de diseño de servicios o de aprendizaje. También en facilitación y en el lado humano de la transformación digital.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <a href={WHATSAPP_URL} className="ds-btn ds-btn-terracota">WhatsApp ↗</a>
              <a href="https://www.linkedin.com/in/kariendiaz/" target="_blank" rel="noreferrer" className="ds-btn ds-btn-ghost-mustard">LinkedIn ↗</a>
              <a href="https://www.instagram.com/karien.xyz/" target="_blank" rel="noreferrer" className="ds-btn ds-btn-ghost-mustard">Instagram ↗</a>
            </div>
            <div
              className="flex flex-col md:flex-row md:justify-between items-center gap-3"
              style={{ fontSize: 12, color: "rgba(245,240,224,0.55)" }}
            >
              <p>Karien.xyz · 2026 · Hecho con curiosidad y paciencia</p>
              <Link to="/lado-b" style={{ color: "#E8B820" }}>← Ir a Lado B</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LadoA;
