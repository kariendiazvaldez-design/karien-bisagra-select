import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { sanityClient, urlFor } from "@/lib/sanityClient";
import { CASE_STUDIES_QUERY, BLOG_POSTS_QUERY } from "@/lib/sanityQueries";

import { projects as portfolioProjects } from "@/data/projects";

const PROJECT_SUBTITLES: Record<string, string> = {
  "innova-plus": "Diseño de servicio · Iteración metodológica",
  "command-z": "Arquitectura de información · Producto digital",
  "washma": "Diseño territorial · Cinco años en campo",
  "patria-c": "Learning experience · Gestión de programa",
  "la-huaca": "Gestión cultural · Activación patrimonial",
};
const PROJECT_ORDER = ["innova-plus", "command-z", "washma", "patria-c", "la-huaca"];

const NAV_LINKS = [
  { label: "Proyectos", href: "#proyectos" },
  { label: "Blog", href: "#blog" },
  { label: "Sobre mí", href: "#sobre-mi" },
];

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
  "UX Research",
  "Facilitación",
  "Comunicación digital",
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
  onHover: (src: string | null) => void;
}) => (
  <span
    onMouseEnter={() => onHover(src)}
    onMouseLeave={() => onHover(null)}
    className="cursor-pointer"
    style={{
      textDecoration: "underline dotted",
      textDecorationColor: "#8C9970",
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  const projects = sanityProjects ?? PROJECTS.map((p) => ({
    ...p, slug: null, mainImage: null, excerpt: p.desc,
  }));
  const posts = sanityPosts ?? POSTS.map((p) => ({
    ...p, slug: null, category: p.cat, excerpt: p.desc, publishedAt: p.date,
  }));

  const scrollToProjects = () => {
    document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]" style={{ borderBottomWidth: "0.5px" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium text-foreground">Karien.xyz</Link>
          <div className="hidden md:flex gap-8 text-sm text-muted-foreground">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-a-accent transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <Link to="/lado-b" className="hidden md:inline text-sm text-a-accent-soft hover:text-a-accent transition-colors">
            Lado B →
          </Link>
          <button
            className="md:hidden text-xl"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            ···
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#D4CFC5] px-6 py-4 flex flex-col gap-3" style={{ borderTopWidth: "0.5px" }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="text-muted-foreground">
                {l.label}
              </a>
            ))}
            <Link to="/lado-b" className="text-a-accent-soft">Lado B →</Link>
          </div>
        )}
      </nav>

      {/* Floating hover image */}
      {hoverImg && (
        <img
          src={hoverImg}
          alt=""
          className="hidden md:block fixed pointer-events-none z-50 transition-opacity duration-300"
          style={{
            left: cursor.x + 24,
            top: cursor.y + 24,
            width: 220,
            height: "auto",
            opacity: 1,
          }}
        />
      )}

      {/* HERO */}
      <section className="lado-a-hero relative min-h-screen flex items-center justify-center px-6 md:px-20 pt-16 text-center">
        <div className="w-full max-w-[680px] mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-mid mb-8">
            Diseño de servicios · Transformación digital
          </p>
          <h1
            className="font-extralight text-[40px] md:text-[72px] leading-[1.05] text-foreground mb-8"
            style={{ letterSpacing: "-0.02em" }}
          >
            Entender mejor,<br />diseñar mejor.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed mx-auto">
            <HoverWord src={HOVER_IMG_1} onHover={setHoverImg}>Comunicadora</HoverWord> de formación,{" "}
            <HoverWord src={HOVER_IMG_2} onHover={setHoverImg}>diseñadora de servicios</HoverWord> en la práctica.
            Traduzco lo complejo en{" "}
            <HoverWord src={HOVER_IMG_3} onHover={setHoverImg}>experiencias concretas</HoverWord>{" "}
            que equipos y organizaciones pueden hacer funcionar.
          </p>
          <button
            onClick={scrollToProjects}
            className="inline-block bg-a-accent text-background px-6 py-2.5 hover:bg-a-accent-mid transition-colors"
          >
            Ver proyectos →
          </button>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-a-accent-soft animate-pulse text-xl">↓</div>
      </section>

      {/* PROYECTOS */}
      <section id="proyectos" className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-mid mb-3">Portafolio</p>
          <h2 className="font-extralight text-4xl md:text-5xl mb-12">Proyectos</h2>
          {(() => {
            const ordered = PROJECT_ORDER
              .map((id) => portfolioProjects.find((p) => p.id === id))
              .filter((p): p is NonNullable<typeof p> => !!p);
            return (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {ordered.map((p, idx) => {
                  let colClasses = "md:col-span-2";
                  if (idx === 3) colClasses = "md:col-span-2 md:col-start-2";
                  if (idx === 4) colClasses = "md:col-span-2 md:col-start-4";
                  return (
                    <Link
                      key={p.id}
                      to={`/portafolio/${p.id}`}
                      className={`group flex flex-col bg-background border border-[#E8E8E8] overflow-hidden hover:bg-[#F5F2EB] transition-colors ${colClasses}`}
                      style={{ borderRadius: 8 }}
                    >
                      <div
                        className="w-full bg-[#D9D9D9]"
                        style={{ height: 200 }}
                      />
                      <div className="p-4 flex flex-col flex-1">
                        <p
                          className="uppercase mb-2"
                          style={{
                            fontFamily: "Lexend, sans-serif",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            color: "#999",
                          }}
                        >
                          {p.projectType[0]}
                        </p>
                        <h3
                          style={{
                            fontFamily: "Lexend, sans-serif",
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#1A1A1A",
                            lineHeight: 1.3,
                            marginBottom: 6,
                          }}
                        >
                          {p.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: "Lexend, sans-serif",
                            fontSize: 13,
                            fontStyle: "italic",
                            color: "#6B7A3E",
                            marginBottom: 10,
                          }}
                        >
                          {PROJECT_SUBTITLES[p.id]}
                        </p>
                        <p
                          className="line-clamp-2"
                          style={{
                            fontFamily: "Lexend, sans-serif",
                            fontSize: 13,
                            color: "#666",
                            lineHeight: 1.5,
                            marginBottom: 14,
                          }}
                        >
                          {p.description}
                        </p>
                        <span
                          className="mt-auto"
                          style={{
                            fontFamily: "Lexend, sans-serif",
                            fontSize: 13,
                            color: "#6B7A3E",
                          }}
                        >
                          Ver caso →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-mid mb-3">Aprendizajes</p>
          <h2 className="font-extralight text-4xl md:text-5xl mb-10">Actualmente curioseando</h2>
          <div className="flex flex-wrap gap-2 mb-12">
            {CATEGORIES.map((cat) => {
              const active = activeCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    active ? "bg-a-accent text-background border-a-accent" : "bg-transparent text-muted-foreground border-a-accent-soft"
                  }`}
                  style={{ borderWidth: "0.5px" }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8">
            {posts.map((post: any, i: number) => {
              const inner = (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-a-accent-mid font-medium mb-2">
                    {post.category || post.cat}
                  </p>
                  <h3 className="font-medium text-[15px] mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {post.excerpt || post.desc}
                  </p>
                  <p className="text-xs text-a-accent-soft">
                    {post.publishedAt && typeof post.publishedAt === "string" && post.publishedAt.includes("-")
                      ? new Date(post.publishedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long" })
                      : post.publishedAt || post.date}
                  </p>
                </>
              );
              const className = `block py-6 md:py-0 ${i < posts.length - 1 ? "border-b md:border-b-0" : ""} border-[#D4CFC5]`;
              const style = { borderBottomWidth: i < posts.length - 1 ? "0.5px" : undefined } as any;
              return post.slug ? (
                <Link key={post._id || post.title} to={`/lado-a/blog/${post.slug}`} className={className} style={style}>
                  {inner}
                </Link>
              ) : (
                <article key={post.title} className={className} style={style}>
                  {inner}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SOBRE MI */}
      <section id="sobre-mi" className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="order-2 md:order-1">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-mid mb-4">Sobre mí</p>
            <h2 className="font-extralight text-[36px] md:text-[48px] mb-6">Karien.</h2>
            <p className="text-base text-muted-foreground max-w-[480px] leading-relaxed mb-6">
              Comunicadora de profesión, formada en mediación cultural. Actualmente diseñadora cursando la Maestría en Gerencia de TI y Transformación Digital. Mi caja de herramientas incluye facilitación para el aprendizaje, UX Design, comunicación digital y project management.
              <br /><br />
              Trabajo para conectar innovación, tecnología y propósito.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {SKILLS.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 text-sm bg-[#EEF0E8] text-a-accent border border-a-accent-soft"
                  style={{ borderWidth: "0.5px" }}
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
              Ver CV →
            </a>
          </div>
          <div className="order-1 md:order-2">
            <img
              src={HOVER_IMG_1}
              alt="Karien"
              className="w-full object-cover"
              style={{ aspectRatio: "4/5" }}
            />
          </div>
        </div>
      </section>


      {/* CONTACTO */}
      <section className="px-6 md:px-20 py-24 md:py-32 bg-[#1C1A17] text-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-soft mb-4">Contacto</p>
          <h2 className="font-extralight text-4xl md:text-6xl text-background mb-6">¿Trabajamos juntos?</h2>
          <p className="text-base text-muted-foreground mb-12 max-w-xl mx-auto">
            Disponible para proyectos de diseño de servicios, facilitación y consultoría en transformación digital.
          </p>
          <div className="flex flex-col items-center max-w-sm mx-auto mb-16">
            {[
              { label: "LinkedIn", href: "#" },
              { label: "Instagram", href: "#" },
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
            <p>Karien.xyz · 2025 · Hecho con curiosidad y paciencia</p>
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
