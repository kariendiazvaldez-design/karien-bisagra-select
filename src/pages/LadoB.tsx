import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BG = "#F2EFE8";
const TERRACOTA = "#C4622D";
const TERRACOTA_SOFT = "#F5E6E0";
const TEXT = "#1C1A17";
const DIVIDER = "#E8E8E8";
const IMG_PH = "#E0D8D0";
const IMG_PH_DARK = "#B5571F";

const TIPO_OPTS = [
  "Todos",
  "Log",
  "Reseña",
  "Apuntes",
  "Handcraft",
  "Miosotis",
];

type GardenPost = {
  id: string;
  nombre: string;
  category: string;
  date: string;
  excerpt: string;
  maturity: string;
  slug: string;
  temas: string[];
  tipo: string;
  coverUrl?: string;
};

const maturityIcon = (m: string) => {
  const k = (m || "").toLowerCase();
  if (k.includes("brote")) return "🌿";
  if (k.includes("fruto")) return "🍂";
  return "🌱";
};

const fmtDate = (d: string) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

type Kind = "log" | "resena" | "apuntes" | "handcraft" | "miosotis" | "other";

const tipoOf = (p: GardenPost): Kind => {
  const t = (p.tipo || "").toLowerCase();
  if (t.includes("log")) return "log";
  if (t.includes("reseñ") || t.includes("resen")) return "resena";
  if (t.includes("apunte") || t.includes("nota")) return "apuntes";
  if (t.includes("handcraft") || t.includes("hand craft") || t.includes("artesan")) return "handcraft";
  if (t.includes("miosotis") || t.includes("diario") || t.includes("pensam")) return "miosotis";
  return "other";
};

const matchesTipoFilter = (p: GardenPost, filter: string) => {
  if (filter === "Todos") return true;
  const k = tipoOf(p);
  if (filter === "Log") return k === "log";
  if (filter === "Reseña") return k === "resena";
  if (filter === "Apuntes") return k === "apuntes";
  if (filter === "Handcraft") return k === "handcraft";
  if (filter === "Miosotis") return k === "miosotis";
  return true;
};

// ---------- NAVBAR ----------
const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-40" style={{ background: BG, borderBottom: `1px solid ${DIVIDER}` }}>
      <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link to="/lado-b" className="font-quicksand font-semibold" style={{ color: TEXT, fontSize: 18 }}>
          karien.xyz
        </Link>
        <div className="hidden md:flex items-center gap-8 font-quicksand" style={{ fontSize: 14 }}>
          <a href="#about" style={{ color: TEXT }}>Sobre mí</a>
          <a href="#jardin" style={{ color: TEXT }}>Jardín</a>
          <Link to="/lado-a" style={{ color: TERRACOTA, fontWeight: 600 }}>Lado A →</Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu" style={{ color: TEXT }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 font-quicksand" style={{ background: BG, borderTop: `1px solid ${DIVIDER}` }}>
          <a href="#about" onClick={() => setOpen(false)} style={{ color: TEXT }}>Sobre mí</a>
          <a href="#jardin" onClick={() => setOpen(false)} style={{ color: TEXT }}>Jardín</a>
          <Link to="/lado-a" onClick={() => setOpen(false)} style={{ color: TERRACOTA, fontWeight: 600 }}>Lado A →</Link>
        </div>
      )}
    </nav>
  );
};

// ---------- HERO ----------
const Hero = () => (
  <section id="about" className="pt-28 md:pt-32 pb-12 px-6 md:px-12">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
      <img
        src="https://res.cloudinary.com/dyh3wxppm/image/upload/v1779250462/21cd0020-2d88-48f5-b41f-b8a5ffd6a0eb.png"
        alt="Karien"
        className="flex-shrink-0 object-cover"
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
        }}
      />
      <div className="flex-1 text-center md:text-left">
        <h1 className="font-caveat" style={{ color: TERRACOTA, fontSize: 48, lineHeight: 1, marginBottom: 16 }}>
          Karien.
        </h1>
        <p className="font-quicksand" style={{ fontSize: 16, color: "#444", lineHeight: 1.6, marginBottom: 16, maxWidth: 580, whiteSpace: "pre-line" }}>
          {"Lectora. Viajera. Nostálgica. Olvidadiza. Compañera de Falkor, perro dragón.\nQuiero escribir para recordar y para hacer una casita fija mientras exploro todo lo que puedo."}
        </p>
        <div className="flex items-center justify-center md:justify-start gap-2 font-quicksand" style={{ fontSize: 14, color: TEXT }}>
          <MapPin size={14} style={{ color: TERRACOTA }} />
          <span>Chiclayo · Lima · Remoto</span>
        </div>
      </div>
    </div>
  </section>
);

// ---------- FILTER CHIPS ----------
const FilterRow = ({
  options,
  active,
  onSelect,
}: {
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) => (
  <div className="flex gap-1.5 overflow-x-auto no-bar" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
    {options.map((opt) => {
      const isActive = active === opt;
      return (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="font-quicksand whitespace-nowrap transition-colors"
          style={{
            fontSize: 12,
            padding: "4px 14px",
            borderRadius: 999,
            border: isActive ? `1px solid ${TERRACOTA}` : "1px solid transparent",
            background: isActive ? TERRACOTA_SOFT : "transparent",
            color: isActive ? TERRACOTA : "#999",
            flexShrink: 0,
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// ---------- CARDS ----------
const Chip = ({ children }: { children: React.ReactNode }) => (
  <span
    className="font-quicksand"
    style={{
      fontSize: 11,
      padding: "3px 8px",
      borderRadius: 999,
      border: `1px solid ${TERRACOTA}`,
      color: TERRACOTA,
    }}
  >
    {children}
  </span>
);

const ImgPlaceholder = ({ h, bg = IMG_PH }: { h: number; bg?: string }) => (
  <div style={{ width: "100%", height: h, background: bg, borderRadius: 2 }} />
);

const Cover = ({
  url,
  h,
  aspectRatio,
  bg = IMG_PH,
  alt = "",
}: {
  url?: string;
  h?: number;
  aspectRatio?: string;
  bg?: string;
  alt?: string;
}) => {
  const style: React.CSSProperties = {
    width: "100%",
    background: bg,
    borderRadius: 2,
    objectFit: "cover",
    display: "block",
  };
  if (h) style.height = h;
  if (aspectRatio) style.aspectRatio = aspectRatio;
  return url ? (
    <img src={url} alt={alt} style={style} loading="lazy" />
  ) : (
    <div style={style} />
  );
};

const LogCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-4 flex flex-col gap-2 h-full"
    style={{ background: TERRACOTA, color: "#FFFFFF", textDecoration: "none", borderRadius: 4 }}
  >
    {p.coverUrl && <Cover url={p.coverUrl} h={90} bg="rgba(0,0,0,0.15)" alt={p.nombre} />}
    <p className="font-caveat" style={{ fontSize: 18, lineHeight: 1 }}>{fmtDate(p.date) || "—"}</p>
    <p
      className="font-quicksand"
      style={{
        fontSize: 13,
        lineHeight: 1.45,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {p.excerpt || p.nombre}
    </p>
  </Link>
);

const ResenaCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-5 flex flex-col gap-2 h-full"
    style={{ background: "#FFFFFF", border: `1px solid ${DIVIDER}`, color: TEXT, textDecoration: "none", borderRadius: 4 }}
  >
    <Cover url={p.coverUrl} aspectRatio="4 / 5" alt={p.nombre} />
    {p.category && (
      <p className="font-quicksand" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginTop: 4 }}>
        {p.category}
      </p>
    )}
    <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 13, color: "#777", lineHeight: 1.55, flex: 1 }}>{p.excerpt}</p>}
    {p.date && <p style={{ color: TERRACOTA, fontSize: 13, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

const ApuntesCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-5 flex flex-col gap-3 h-full"
    style={{ background: "#F3EDE8", color: TEXT, textDecoration: "none", borderRadius: 4 }}
  >
    <Cover url={p.coverUrl} h={140} alt={p.nombre} />
    <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.25 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 13, color: "#666", lineHeight: 1.55, flex: 1 }}>{p.excerpt}</p>}
    {p.date && <p style={{ color: TERRACOTA, fontSize: 13, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

const HandcraftCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-4 flex flex-col gap-2 h-full"
    style={{ background: "#C9963A", color: "#FFFFFF", textDecoration: "none", borderRadius: 4 }}
  >
    <Cover url={p.coverUrl} h={100} bg="rgba(0,0,0,0.15)" alt={p.nombre} />
    <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, flex: 1 }}>{p.excerpt}</p>}
  </Link>
);

const MiosotisCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-5 flex flex-col gap-2 h-full"
    style={{ background: "#7B2D3E", color: "#FFFFFF", textDecoration: "none", borderRadius: 4 }}
  >
    {p.coverUrl && <Cover url={p.coverUrl} h={120} bg="rgba(255,255,255,0.1)" alt={p.nombre} />}
    <h3 className="font-caveat" style={{ fontSize: 24, fontStyle: "italic", lineHeight: 1.15 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, flex: 1 }}>{p.excerpt}</p>}
    {p.date && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

const OtherCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-5 flex flex-col gap-2 h-full"
    style={{ background: "#F2EFE8", border: `1px solid ${DIVIDER}`, color: TEXT, textDecoration: "none", borderRadius: 4 }}
  >
    <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 13, color: "#666", lineHeight: 1.5, flex: 1 }}>{p.excerpt}</p>}
    {p.date && <p style={{ color: TERRACOTA, fontSize: 13, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

// ---------- BENTO ----------
const bentoSpanClass = (kind: Kind) => {
  if (kind === "resena") return "col-span-1 md:row-span-2";
  if (kind === "apuntes") return "col-span-1 md:col-span-2";
  if (kind === "miosotis") return "col-span-1 md:col-span-2";
  return "col-span-1";
};

const Bento = ({ posts }: { posts: GardenPost[] }) => (
  <>
    <style>{`
      .bento-grid { display: grid; gap: 16px; grid-template-columns: 1fr; grid-auto-rows: minmax(120px, auto); }
      @media (min-width: 768px) { .bento-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1024px) { .bento-grid { grid-template-columns: repeat(4, 1fr); } }
      .no-bar::-webkit-scrollbar { display: none; }
    `}</style>
    <div className="bento-grid">
      {posts.map((p) => {
        const kind = tipoOf(p);
        return (
          <div key={p.id} className={bentoSpanClass(kind)}>
            {kind === "log" && <LogCard p={p} />}
            {kind === "resena" && <ResenaCard p={p} />}
            {kind === "apuntes" && <ApuntesCard p={p} />}
            {kind === "handcraft" && <HandcraftCard p={p} />}
            {kind === "miosotis" && <MiosotisCard p={p} />}
            {kind === "other" && <OtherCard p={p} />}
          </div>
        );
      })}
    </div>
  </>
);

const BentoSkeleton = () => (
  <div className="bento-grid">
    {[
      "col-span-1 md:col-span-2 md:row-span-2",
      "col-span-1 md:row-span-2",
      "col-span-1",
      "col-span-1",
      "col-span-1 md:col-span-2 md:row-span-2",
      "col-span-1",
    ].map((cls, i) => (
      <div key={i} className={cls} style={{ background: "#EAE6DE", borderRadius: 4, minHeight: 120 }} />
    ))}
  </div>
);

// ---------- HOOKS ----------
function useGardenPosts() {
  const [posts, setPosts] = useState<GardenPost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-garden-posts");
        if (error) throw error;
        setPosts(data?.posts || []);
      } catch (e) {
        console.error("garden fetch", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { posts, loading };
}

// ---------- PAGE ----------
const LadoB = () => {
  const { posts, loading } = useGardenPosts();
  const [tipo, setTipo] = useState("Todos");
  const [tema, setTema] = useState("Todos");

  const temas = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => p.temas.forEach((t) => t && s.add(t)));
    return ["Todos", ...Array.from(s)];
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const tipoOk = matchesTipoFilter(p, tipo);
      const temaOk = tema === "Todos" || p.temas.includes(tema);
      return tipoOk && temaOk;
    });
  }, [posts, tipo, tema]);

  return (
    <div className="font-quicksand min-h-screen" style={{ background: BG, color: TEXT }}>
      <Navbar />
      <Hero />
      <div style={{ borderTop: `1px solid ${DIVIDER}` }} />

      <section id="jardin" className="px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <FilterRow options={TIPO_OPTS} active={tipo} onSelect={setTipo} />
            <FilterRow options={temas} active={tema} onSelect={setTema} />
          </div>

          {loading ? (
            <BentoSkeleton />
          ) : filtered.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: "60px 0" }} className="font-quicksand">
              El jardín está creciendo 🌱
            </p>
          ) : (
            <Bento posts={filtered} />
          )}
        </div>
      </section>

      <section id="exploraciones" className="px-6 md:px-12" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="font-quicksand"
            style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}
          >
            Exploraciones:
          </p>
          <h2 className="font-quicksand" style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 16 }}>
            Lugares donde se mueve mi corazón estos días
          </h2>
          <div style={{ borderTop: `1px solid ${DIVIDER}`, marginBottom: 32 }} />

          <style>{`
            .notas-bento {
              display: grid;
              gap: 8px;
              grid-template-columns: repeat(2, 1fr);
              grid-auto-rows: 180px;
            }
            .notas-bento .nb-resena { grid-column: 1; grid-row: 1 / span 2; }
            .notas-bento .nb-miosotis { grid-column: 2; grid-row: 1; }
            .notas-bento .nb-diario-1 { grid-column: 2; grid-row: 2; }
            .notas-bento .nb-handcraft { grid-column: 1 / span 2; grid-row: 3; }
            .notas-bento .nb-diario-2 { display: none; }
            .notas-bento .nb-blog { grid-column: 1 / span 2; grid-row: 4; height: 80px; }
            @media (min-width: 768px) {
              .notas-bento {
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: 180px 180px 80px;
              }
              .notas-bento .nb-resena { grid-column: 1; grid-row: 1 / span 2; }
              .notas-bento .nb-miosotis { grid-column: 2 / span 2; grid-row: 1; }
              .notas-bento .nb-diario-1 { grid-column: 4; grid-row: 1; }
              .notas-bento .nb-handcraft { grid-column: 2 / span 2; grid-row: 2; }
              .notas-bento .nb-diario-2 { display: flex; grid-column: 4; grid-row: 2; }
              .notas-bento .nb-blog { grid-column: 1 / span 4; grid-row: 3; height: auto; }
            }
            .nb-card { border-radius: 12px; overflow: hidden; position: relative; display: flex; flex-direction: column; }
            .nb-card img.nb-cover { width: 100%; height: 100%; object-fit: cover; display: block; }
            .nb-badge { display: inline-block; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; }
          `}</style>

          <div className="notas-bento">
            {/* Reseña */}
            <div className="nb-card nb-resena" style={{ background: "#D4A01722", border: "0.5px solid #D4A01766" }}>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "#E8D9A8" }} />
              </div>
              <div style={{ padding: 10 }}>
                <span className="nb-badge font-quicksand" style={{ background: "#D4A01733", color: "#8A6A10", marginBottom: 6 }}>Reseña</span>
                <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 13, color: TEXT, lineHeight: 1.3, marginTop: 6 }}>Un año de conversaciones compartidas.</h3>
              </div>
            </div>

            {/* Miosotis */}
            <div className="nb-card nb-miosotis" style={{ background: "#7B2D3E" }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
              <div style={{ position: "relative", padding: 14, color: "#FAF0F2", display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
                <span className="nb-badge font-quicksand" style={{ background: "rgba(255,255,255,0.18)", color: "#FAF0F2", alignSelf: "flex-start" }}>Miosotis</span>
                <h3 className="font-caveat" style={{ fontSize: 26, lineHeight: 1.15, fontStyle: "italic" }}>Pequeños recuerdos sin orden.</h3>
              </div>
            </div>

            {/* Diario 1 */}
            <div className="nb-card nb-diario-1" style={{ background: "var(--background)", border: "0.5px solid hsl(var(--border))" }}>
              <div style={{ flex: 1, background: "#E0D8D0" }} />
              <div style={{ padding: 10 }}>
                <span className="nb-badge font-quicksand" style={{ background: "transparent", color: TERRACOTA, border: `0.5px solid ${TERRACOTA}` }}>Diario</span>
                <p className="font-quicksand" style={{ fontSize: 12, color: TEXT, marginTop: 6, lineHeight: 1.4 }}>Notas del día.</p>
              </div>
            </div>

            {/* Handcraft */}
            <div className="nb-card nb-handcraft" style={{ background: "#1C2B4A" }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
              <div style={{ position: "relative", padding: 14, color: "#C8D8EE", display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
                <span className="nb-badge font-quicksand" style={{ background: "rgba(255,255,255,0.15)", color: "#C8D8EE", alignSelf: "flex-start" }}>Handcraft</span>
                <h3 className="font-quicksand" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>Tallercitos para dar cuerpo a los libros, con lo que hay.</h3>
              </div>
            </div>

            {/* Diario 2 */}
            <div className="nb-card nb-diario-2" style={{ background: "var(--background)", border: "0.5px solid hsl(var(--border))" }}>
              <div style={{ flex: 1, background: "#E0D8D0" }} />
              <div style={{ padding: 10 }}>
                <span className="nb-badge font-quicksand" style={{ background: "transparent", color: TERRACOTA, border: `0.5px solid ${TERRACOTA}` }}>Diario</span>
                <p className="font-quicksand" style={{ fontSize: 12, color: TEXT, marginTop: 6, lineHeight: 1.4 }}>Otro fragmento.</p>
              </div>
            </div>

            {/* Blog */}
            <a href="#" className="nb-card nb-blog" style={{ background: "#6B6B2A", textDecoration: "none" }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
              <div style={{ position: "relative", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: "100%", color: "#E8E8C0" }}>
                <span className="nb-badge font-quicksand" style={{ background: "rgba(255,255,255,0.15)", color: "#E8E8C0" }}>Blog</span>
                <h3 className="font-quicksand" style={{ fontSize: 14, fontWeight: 700, textAlign: "center", flex: 1 }}>Lecturas largas y exploraciones de fondo</h3>
                <span style={{ fontSize: 18 }}>→</span>
              </div>
            </a>
          </div>

        </div>
      </section>
    </div>
  );
};

export default LadoB;
