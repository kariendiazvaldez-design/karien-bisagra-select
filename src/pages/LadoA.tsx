import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { sanityClient, urlFor } from "@/lib/sanityClient";
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

import { projects as portfolioProjects } from "@/data/projects";

const PROJECT_SUBTITLES: Record<string, string> = {
  "innova-plus": "Diseño de servicio · Iteración metodológica",
  "command-z": "Arquitectura de información · Producto digital",
  "washma": "Diseño territorial · Cinco años en campo",
  "patria-c": "Learning experience · Gestión de programa",
  "la-huaca": "Gestión cultural · Activación patrimonial",
};
const PROJECT_ORDER = ["innova-plus", "command-z", "washma", "patria-c", "la-huaca"];

const NAV_LINKS: { label: string; href: string; to?: string }[] = [
  { label: "Proyectos", href: "#proyectos" },
  { label: "Blog", href: "/blog", to: "/blog" },
  { label: "Sobre mí", href: "#sobre-mi" },
];

const WHATSAPP_URL = "https://wa.me/51927822614?text=" + encodeURIComponent("Hola, vengo de tu web!");

const PROJECTS = [
  {
    tag: "Service Design",
    title: "Rediseño de experiencia ciudadana",
    desc: "Investigación y prototipado de servicios públicos orientados a la ciudadanía digital.",
  },
  {
    tag: "UX Research",
    title: "Plataforma de aprendizaje colaborativo",
    desc: "Diseño centrado en comunidades de práctica para organizaciones educativas.",
  },
  {
    tag: "Transformación Digital",
    title: "Estrategia digital para museo nacional",
    desc: "Acompañamiento en la definición de hoja de ruta digital para un museo de arte.",
  },
  {
    tag: "Service Design",
    title: "Sistema de gestión de voluntariado",
    desc: "Diseño de flujos y herramientas para coordinar redes de voluntarios.",
  },
];

const POSTS = [
  {
    cat: "Comunidades Digitales",
    title: "¿Qué hace que una comunidad esté viva?",
    desc: "¿Qué necesita? ¿Cómo se mide? ¿Se sostiene enteramente en digital?",
    date: "Marzo 2025",
  },
  {
    cat: "Diseño x Aprendizaje",
    title: "Dónde la información se convierte en aprendizaje",
    desc: "¿Cómo impacta la experiencia de usuario? ¿De qué sirve documentar?",
    date: "Febrero 2025",
  },
  {
    cat: "Museos",
    title: "Transformación digital en museos",
    desc: "¿Qué se puede esperar de los museos? ¿Cómo impacta la transformación?",
    date: "Enero 2025",
  },
];

const CATEGORIES = [
  "Todos",
  "Comunidades digitales",
  "Diseño x Aprendizaje",
  "Museos",
  "Transformación Digital",
];

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
      textDecorationColor: "#E8E4DA",
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
  const handleHover = (src: string | null, x?: number, y?: number) => {
    if (src && typeof x === "number" && typeof y === "number") {
      setCursor({ x, y });
    }
    setHoverImg(src);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const [sanityProjects, setSanityProjects] = useState<any[] | null>(null);
  const [sanityPosts, setSanityPosts] = useState<any[] | null>(null);

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

  const projects = sanityProjects ?? PROJECTS.map((p) => ({
    ...p, slug: null, mainImage: null, excerpt: p.desc,
  }));

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
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "rgba(250, 250, 248, 0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium text-white">Karien.xyz</Link>
          <div className="hidden md:flex gap-8 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            {NAV_LINKS.map((l) =>
              l.to ? (
                <Link key={l.label} to={l.to} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </a>
              )
            )}
          </div>
          <Link to="/lado-b" className="hidden md:inline text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.85)" }}>
            Lado B →
          </Link>
          <button
            className="md:hidden text-xl text-white"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            ···
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 py-4 flex flex-col gap-3" style={{ backgroundColor: "rgba(26, 26, 17, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            {NAV_LINKS.map((l) =>
              l.to ? (
                <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)} className="text-white/85 hover:text-white transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="text-white/85 hover:text-white transition-colors">
                  {l.label}
                </a>
              )
            )}
            <Link to="/lado-b" className="text-white/85 hover:text-white transition-colors">Lado B →</Link>
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
            opacity: 1,
          }}
        />
      )}

      {/* HERO */}
      <section
        className="lado-a-hero relative flex items-center justify-center px-6 md:px-20 pt-24 text-center"
        style={{
          minHeight: "80vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1621610087641-f3e6fbe7a3d5?fm=jpg&q=60&w=3000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(26, 26, 17, 0.75)" }} />
        <div className="relative w-full max-w-[680px] mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.25em] mb-8" style={{ color: "#E8E4DA" }}>
            Diseño de servicios · Transformación digital
          </p>
          <h1
            className="font-extralight text-[40px] md:text-[72px] leading-[1.05] mb-8"
            style={{ letterSpacing: "-0.02em", color: "#FFFFFF" }}
          >
            Entender mejor,<br />diseñar mejor.
          </h1>
          <style>{`
            @keyframes ladoa-status-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes ladoa-green-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.82); opacity: 0.45; } }
          `}</style>
          <p className="text-base md:text-lg mb-8 leading-relaxed mx-auto whitespace-pre-line" style={{ color: "#F5F2EB" }}>
            <HoverWord src={HOVER_IMG_3} onHover={handleHover}>Comunicadora</HoverWord> de formación,{" "}
            <HoverWord src={HOVER_IMG_1} onHover={handleHover}>diseñadora de servicios</HoverWord> en la práctica.{"\n"}
            Facilito procesos, investigo experiencias y trabajo con <HoverWord src={HOVER_IMG_2} onHover={handleHover}>equipos</HoverWord> que quieren entender mejor antes de actuar.
          </p>

        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse text-xl" style={{ color: "#E8E4DA" }}>↓</div>
      </section>

      {/* STATUS SECTION */}
      <section className="px-6 md:px-20 py-16 md:py-20" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4CAF50",
                animation: "ladoa-green-pulse 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B2A", fontWeight: 500 }}>
              En este momento estoy →
            </span>
          </div>

          <div>
            {[
              "Diseñando servicios con BioActiva, un hub de innovación en I+D+i",
              "Investigando cómo unir al Museo más antiguo de Lambayeque con Transformación Digital para fortalecer la conexión con sus públicos",
              "Aprendiendo sobre diseño desde el team Command Z Podcast",
              "Conectando miradas desde Sur Global y su revista Untold.ink",
            ].map((item, i, arr) => (
              <div
                key={i}
                style={{
                  padding: "9px 0",
                  borderBottom: i < arr.length - 1 ? "0.5px solid rgba(107,107,42,0.1)" : "none",
                  fontSize: 13,
                  color: "#4a4a3a",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <span style={{ color: "#6B6B2A" }}>–</span>
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center mt-6" style={{ gap: 10 }}>
            <button
              onClick={scrollToProjects}
              style={{
                background: "#7D2340",
                color: "#FFFFFF",
                borderRadius: 8,
                padding: "9px 18px",
                fontSize: 13,
                fontFamily: "Lexend, sans-serif",
                border: "none",
                cursor: "pointer",
              }}
            >
              Portafolio →
            </button>
            <a
              href="#contacto"
              style={{
                background: "transparent",
                border: "0.5px solid #6B6B2A",
                color: "#6B6B2A",
                borderRadius: 8,
                padding: "9px 18px",
                fontSize: 13,
                fontFamily: "Lexend, sans-serif",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              ¿Conversemos? →
            </a>
            <Link
              to="/blog"
              style={{
                background: "transparent",
                border: "0.5px solid #6B6B2A",
                color: "#6B6B2A",
                borderRadius: 8,
                padding: "9px 18px",
                fontSize: 13,
                fontFamily: "Lexend, sans-serif",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Al blog →
            </Link>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-mid mb-3">Aprendizajes</p>
          <h2 className="font-extralight text-4xl md:text-5xl mb-10">Actualmente curioseando:</h2>
          <div className="mb-4">
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: 8 }}>
              Temas
            </p>
            <div className="flex flex-wrap gap-2">
              {dynamicCategories.map((cat) => {
                const active = activeCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className="px-4 py-2 text-sm transition-colors"
                    style={{
                      border: "1px solid #6B7A3E",
                      backgroundColor: active ? "#6B7A3E" : "transparent",
                      color: active ? "#FFFFFF" : "#6B7A3E",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-12">
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: 8 }}>
              Formato
            </p>
            <div className="flex flex-wrap gap-2">
              {dynamicTipos.map((t) => {
                const active = activeTipo === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTipo(t)}
                    className="px-4 py-2 text-sm transition-colors"
                    style={{
                      border: "1px solid #6B7A3E",
                      backgroundColor: active ? "#6B7A3E" : "transparent",
                      color: active ? "#FFFFFF" : "#6B7A3E",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const CAT_COLOR: Record<string, string> = {
              "Service Design": "#6B7A3E",
              "Research": "#8A9A5A",
              "Diseño": "#C49A2A",
              "Tecnología": "#7A8A6A",
              "Educación": "#9AAA7A",
            };
            const getCatColor = (c: string) => CAT_COLOR[c] ?? "#E8E8E8";
            const limitedPosts = filteredPosts.slice(0, 4);

            if (notionLoading) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse"
                      style={{
                        background: "#FFFFFF",
                        border: "0.5px solid #E8E8E8",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ height: 3, background: "#E8E8E8" }} />
                      <div style={{ padding: 20 }}>
                        <div className="h-3 w-24 bg-[#E8E8E8] mb-3" />
                        <div className="h-4 w-3/4 bg-[#E8E8E8] mb-3" />
                        <div className="h-3 w-full bg-[#E8E8E8] mb-2" />
                        <div className="h-3 w-5/6 bg-[#E8E8E8]" />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            if (limitedPosts.length === 0) {
              return <p className="text-center text-muted-foreground py-12">Nada publicado aún</p>;
            }
            return (
              <div
                className="grid grid-cols-1 md:grid-cols-2"
                style={{ gap: 20, rowGap: 20 }}
              >
                {limitedPosts.map((post) => {
                  const lineColor = getCatColor(post.category);
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
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ height: 3, background: lineColor }} />
                      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                        <p
                          className="uppercase"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.18em",
                            color: "#8A9A5A",
                            marginBottom: 10,
                          }}
                        >
                          {post.category}
                        </p>
                        <h3
                          style={{
                            fontFamily: "Lexend, sans-serif",
                            fontWeight: 700,
                            fontSize: 15,
                            lineHeight: 1.4,
                            color: "#1A1A1A",
                            marginBottom: 10,
                          }}
                        >
                          {post.title}
                        </h3>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#777",
                            lineHeight: 1.7,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            marginBottom: 16,
                          }}
                        >
                          {post.excerpt}
                        </p>
                        <div
                          className="mt-auto flex items-center justify-between"
                          style={{ fontSize: 11 }}
                        >
                          <span style={{ color: "#aaa" }}>{formattedDate}</span>
                          <span style={{ color: "#8A9A5A" }}>Leer →</span>
                        </div>
                      </div>
                    </div>
                  );
                  return post.slug ? (
                    <Link key={post.id} to={`/blog/${post.slug}`}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={post.id}>{inner}</div>
                  );
                })}
              </div>
            );
          })()}

          <div className="mt-12 text-center">
            <Link
              to="/blog"
              className="inline-block transition-colors"
              style={{
                border: "1px solid #8A9A5A",
                color: "#8A9A5A",
                padding: "10px 24px",
                background: "transparent",
                borderRadius: 4,
              }}
            >
              Ver más →
            </Link>
          </div>
        </div>
      </section>
      {/* SOBRE MI */}
      <section id="sobre-mi" style={{ backgroundColor: "#FAFAF8" }} className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          {/* Texto */}
          <div className="flex-1 order-2 md:order-1">
            <p className="text-xs font-medium uppercase tracking-[0.25em] mb-4" style={{ color: "#9a9a8a" }}>
              Sobre mí
            </p>
            <h2 className="font-extralight text-[36px] md:text-[48px] mb-6" style={{ color: "#1a1a14" }}>
              Karien:
            </h2>
            <p className="leading-relaxed mb-6 whitespace-pre-line" style={{ fontSize: 14, color: "#4a4a3a", maxWidth: 520, lineHeight: 1.65 }}>
              Llegué al diseño de servicios desde la comunicación, y me quedé porque es una forma de entender cómo las personas viven lo que las organizaciones construyen, y de hacer algo al respecto. Trabajo en el cruce entre investigación, facilitación y diseño, con equipos que están transitando cambios y buscan claridad para crear soluciones. He colaborado con programas educativos, en innovación corporativa y con comunidades en distintas regiones del Perú.{"\n\n"}Ahora mismo me interesan los retos de mayor escala y complejidad sistémica: la intersección entre IA y diseño de servicios, el diseño ecosistémico, y el puente entre STEM (tecnología) y GLAM (museos).{"\n\n"}Actualmente curso la maestría de Transformación Digital, desarrollando una tesis que explora cómo pasar de la digitación a la digitalización en el Museo Brüning de Lambayeque. Me formé en mediación cultural y eso no se me ha ido: creo que las mejores intervenciones parten de escuchar bien y de conectar a los stakeholders vinculados. Manifiesto ir a la maestría SdSi en el futuro. Mientras tanto, trabajo en remoto y busco conocer el Perú mientras aprendo.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {SKILLS.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 text-sm"
                  style={{
                    background: "#EEF0E8",
                    color: "#4A5232",
                    border: "0.5px solid #8C9970",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <a
              href="https://docs.google.com/document/d/1DBVwPjFIQ-Zu9P8tTLyugaJP77exdsA2iA9CIyOFMtI/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-a-accent text-background px-5 py-2.5 hover:bg-a-accent-mid transition-colors"
            >
              Perfil profesional →
            </a>
          </div>

          {/* Imagen */}
          <div className="order-1 md:order-2 flex-shrink-0 w-full md:w-auto" style={{ maxWidth: 380 }}>
            <img
              src={HOVER_IMG_1}
              alt="Karien"
              className="w-full object-cover h-[260px] md:h-auto"
              style={{
                borderRadius: 12,
                maxHeight: "100%",
              }}
            />
          </div>
        </div>
      </section>
      {/* PROYECTOS */}
      <section id="proyectos" style={{ background: "#FAFAF8" }} className="px-6 md:px-20 py-24 md:py-32 font-lexend">
        <div className="max-w-6xl mx-auto">
          <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#9a9a8a" }} className="uppercase mb-3 font-medium">
            Portafolio
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 500, color: "#1a1a14" }} className="mb-10">
            Proyectos:
          </h2>
          {(() => {
            const PROJECT_IMAGES: Record<string, string> = {
              "innova-plus":
                "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1777913304/2_brm4jt.png",
              "command-z":
                "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1779259677/Captura_de_pantalla_2026-05-20_012733_b5ntfl.png",
              "la-huaca":
                "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1779303598/53364966_437290196813210_7415387592050343936_n_qibyj3.jpg",
            };

            type CardData = {
              id: string;
              category: string;
              title: string;
              scale: string;
              description: string;
            };

            const HERO: CardData = {
              id: "innova-plus",
              category: "Diseño de servicios · Innovación corporativa",
              title: "INNOVA+ 2025: programa de I+D+i para empresas",
              scale:
                "Consultoría de BioActiva para el BID · 22 empresas / 150 participantes · 84% asistencia · 4,2/5 satisfacción",
              description:
                "Rediseñé la segunda edición a partir de investigación sistematizada de la primera: VOC, CSAT y observación en campo. Diseñé el blueprint completo, la experiencia de aprendizaje, evaluación y estructura de contenido, integré mentorías al ciclo formativo y ejecuté end to end.",
            };

            const ROW1: CardData[] = [
              {
                id: "command-z",
                category: "Arquitectura de información · Producto digital",
                title: "Command Z: del podcast al sistema de aprendizaje",
                scale: "+150 episodios · 4 rutas de aprendizaje · 3 perfiles de usuario",
                description:
                  "Analicé y estructuré el archivo completo del podcast usando Python y la API de Spotify. Diseñé y desarrollé una app navegable con no code: rutas de aprendizaje en 3 niveles para engagement con el oyente.",
              },
              {
                id: "patria-c",
                category: "Diseño de servicios · Project management",
                title: "Patria C: academia ciudadana para jóvenes de todo el Perú",
                scale: "150 becarios · todas las regiones del país · NPS 91% · permanencia 80%",
                description:
                  "Diseñé y gestioné la experiencia end-to-end de un programa remoto para jóvenes líderes. Coordiné equipos internos, stakeholders corporativos y el cierre presencial.",
              },
            ];

            const ROW2: CardData[] = [
              {
                id: "washma",
                category: "Desarrollo comunitario · Project management",
                title: "WASHMA: mujeres kañaris tejiendo identidad",
                scale: "S/64,000 ejecutados · 100% ejecución física y financiera · 4 ediciones Ruraq Maki",
                description:
                  "Formulé y gestioné un plan de negocio financiado por AgroRural–MIDAGRI tras 03 años de trabajar con la asociación para la recuperación de sus saberes textiles. Resultado: participación sostenida y autónoma de la asociación en el mercado nacional.",
              },
              {
                id: "la-huaca",
                category: "Gestión cultural · Project management",
                title: "La Huaca Independiente: festival en espacios patrimoniales",
                scale: "3 ediciones · +2,500 asistentes · 150 voluntarios · alianza Ministerio de Cultura",
                description:
                  "Co-fundé y coordiné un festival cultural en espacios patrimoniales de Lambayeque, enfocado en juventudes. Activación territorial con alianzas institucionales y comunidad de voluntarios.",
              },
            ];

            const cardBase: React.CSSProperties = {
              background: "#ffffff",
              border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: 12,
              transition: "border-color 0.2s ease",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            };

            const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.borderColor = "rgba(107,107,42,0.35)";
            };
            const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
            };

            const Badge = ({ text }: { text: string }) => (
              <span
                style={{
                  background: "rgba(107,107,42,0.07)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: 12,
                  color: "#6B6B2A",
                  alignSelf: "flex-start",
                }}
              >
                {text}
              </span>
            );

            const Category = ({ text }: { text: string }) => (
              <p
                className="uppercase"
                style={{ fontSize: 10, color: "#6B6B2A", letterSpacing: "0.08em", fontWeight: 500 }}
              >
                {text}
              </p>
            );

            const Title = ({ text }: { text: string }) => (
              <h3 style={{ fontSize: 17, fontWeight: 500, color: "#1a1a14", lineHeight: 1.3 }}>{text}</h3>
            );

            const Desc = ({ text }: { text: string }) => (
              <p style={{ fontSize: 13, color: "#5a5a4a", lineHeight: 1.55 }}>{text}</p>
            );

            const SeeCase = () => (
              <span style={{ fontSize: 12, color: "#6B6B2A", fontWeight: 500, marginTop: "auto" }}>
                Ver caso →
              </span>
            );

            const ImagePlaceholder = ({ src, alt, side }: { src?: string; alt: string; side: "right" | "top" }) =>
              side === "right" ? (
                <div
                  className="hidden md:block shrink-0"
                  style={{
                    width: 160,
                    background: "rgba(107,107,42,0.07)",
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {src && <img src={src} alt={alt} className="w-full h-full object-cover" />}
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 140,
                    background: "rgba(107,107,42,0.07)",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {src && <img src={src} alt={alt} className="w-full h-full object-cover" />}
                </div>
              );

            const SmallCard = ({ c }: { c: CardData }) => (
              <Link
                to={`/portafolio/${c.id}`}
                style={cardBase}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                className="group"
              >
                <ImagePlaceholder src={PROJECT_IMAGES[c.id]} alt={c.title} side="top" />
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <Category text={c.category} />
                  <Title text={c.title} />
                  <Badge text={c.scale} />
                  <Desc text={c.description} />
                  <SeeCase />
                </div>
              </Link>
            );

            return (
              <div className="flex flex-col gap-4">
                {/* Hero card */}
                <Link
                  to={`/portafolio/${HERO.id}`}
                  style={{ ...cardBase, flexDirection: "row", padding: 0 }}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                  className="group"
                >
                  <div
                    style={{
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <Category text={HERO.category} />
                    <Title text={HERO.title} />
                    <Badge text={HERO.scale} />
                    <Desc text={HERO.description} />
                    <SeeCase />
                  </div>
                  <ImagePlaceholder src={PROJECT_IMAGES[HERO.id]} alt={HERO.title} side="right" />
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ROW1.map((c) => (
                    <SmallCard key={c.id} c={c} />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ROW2.map((c) => (
                    <SmallCard key={c.id} c={c} />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>


      {/* CONTACTO */}
      <section className="px-6 md:px-20 py-24 md:py-32 bg-[#1C1A17] text-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-soft mb-4">Contacto</p>
          <h2 className="font-extralight text-4xl md:text-6xl text-background mb-6">¿Un proyecto juntxs?</h2>
          <p className="text-base text-muted-foreground mb-12 max-w-xl mx-auto">
            Interesada en proyectos de diseño de servicios o de aprendizaje. También en facilitación y en retos de el lado humano de la transformación digital.
          </p>
          <div className="flex flex-col items-center max-w-sm mx-auto mb-16">
            {[
              { label: "WhatsApp", href: WHATSAPP_URL },
              { label: "LinkedIn", href: "#" },
              { label: "Instagram", href: "https://www.instagram.com/karien.xyz/" },
            ].map((l, i, arr) => (
              <a
                key={l.label}
                href={l.href}
                className={`w-full py-5 text-background hover:text-a-accent-soft transition-colors ${
                  i < arr.length - 1 ? "border-b" : ""
                }`}
                style={{ borderColor: "#2C2C2A", borderBottomWidth: i < arr.length - 1 ? "0.5px" : undefined }}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>Karien.xyz · 2026 · Hecho con curiosidad y paciencia</p>
            <Link to="/lado-b" className="text-a-accent-soft hover:text-background transition-colors">
              ← Ir a Lado B
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LadoA;
