import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Menu, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

const BG = "#F2EFE8";
const TERRACOTA = "#C4622D";
const TERRACOTA_SOFT = "#F5E6E0";
const TEXT = "#1C1A17";
const DIVIDER = "#E8E8E8";

const TIPO_OPTS = [
  "Todos",
  "Reseña",
  "Miosotis",
  "Diario",
  "Handcraft",
  "Blog",
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

const fmtDate = (d: string) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

type Slot = "resena" | "miosotis" | "diario" | "handcraft" | "blog";

const slotOf = (p: GardenPost): Slot | null => {
  const t = (p.tipo || "").toLowerCase();
  if (t.includes("reseñ") || t.includes("resen")) return "resena";
  if (t.includes("miosotis")) return "miosotis";
  if (t.includes("handcraft") || t.includes("artesan")) return "handcraft";
  if (t.includes("diario") || t.includes("log")) return "diario";
  if (t.includes("blog") || t.includes("apunte") || t.includes("nota")) return "blog";
  return null;
};

const matchesTipoFilter = (p: GardenPost, filter: string) => {
  if (filter === "Todos") return true;
  const k = slotOf(p);
  if (filter === "Reseña") return k === "resena";
  if (filter === "Miosotis") return k === "miosotis";
  if (filter === "Diario") return k === "diario";
  if (filter === "Handcraft") return k === "handcraft";
  if (filter === "Blog") return k === "blog";
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
          <Link to="/" style={{ color: TERRACOTA, fontWeight: 600 }}>Lado A →</Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu" style={{ color: TEXT }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 font-quicksand" style={{ background: BG, borderTop: `1px solid ${DIVIDER}` }}>
          <a href="#about" onClick={() => setOpen(false)} style={{ color: TEXT }}>Sobre mí</a>
          <a href="#jardin" onClick={() => setOpen(false)} style={{ color: TEXT }}>Jardín</a>
          <Link to="/" onClick={() => setOpen(false)} style={{ color: TERRACOTA, fontWeight: 600 }}>Lado A →</Link>
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
        <h1 className="font-pt-serif" style={{ color: TERRACOTA, fontSize: 48, lineHeight: 1, marginBottom: 16, fontWeight: 400 }}>
          Karien
        </h1>
        <p className="font-quicksand" style={{ fontSize: 16, color: "#444", lineHeight: 1.6, marginBottom: 16, maxWidth: 580, whiteSpace: "pre-line" }}>
          {"Lectora. Viajera. Nostálgica. Olvidadiza.\nCompañera de Falkor, perro dragón. Quiero escribir para recordar y para hacer una casita fija entre memorias, mientras exploro todo lo que puedo."}
        </p>
        <div className="flex items-center justify-center md:justify-start gap-2 font-quicksand" style={{ fontSize: 14, color: TEXT }}>
          <MapPin size={14} style={{ color: TERRACOTA }} />
          <span>Chiclayo · Lima · En todos lados.</span>
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

// ---------- BENTO CARDS ----------
const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span
    className="font-quicksand"
    style={{
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 999,
      background: bg,
      color,
      fontWeight: 600,
      letterSpacing: "0.04em",
      display: "inline-block",
      width: "fit-content",
    }}
  >
    {label}
  </span>
);

const CategoryDate = ({
  label,
  date,
  color,
  bg,
  dateColor = "#777",
}: {
  label: string;
  date: string;
  color: string;
  bg: string;
  dateColor?: string;
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <Badge label={label} color={color} bg={bg} />
    {date && (
      <span className="font-quicksand truncate" style={{ color: dateColor, fontSize: 10, fontWeight: 500 }}>
        {fmtDate(date)}
      </span>
    )}
  </div>
);

const Excerpt = ({ text, color = "#555", lines = 2 }: { text: string; color?: string; lines?: number }) => {
  if (!text) return null;
  return (
    <p
      className="font-quicksand"
      style={{
        fontSize: 11,
        lineHeight: 1.4,
        color,
        margin: 0,
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {text}
    </p>
  );
};

const ResenaCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="cell resena"
    style={{
      background: "#D4A01722",
      border: "0.5px solid #D4A01766",
      borderRadius: 12,
      overflow: "hidden",
      textDecoration: "none",
      color: TEXT,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ flex: 1, overflow: "hidden", background: "#D4A01733" }}>
      {p.coverUrl && (
        <img src={p.coverUrl} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
      )}
    </div>
    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      <CategoryDate label="Reseña" date={p.date} color="#7A5A0E" bg="#D4A01744" dateColor="#6B5A2A" />
      <h3 className="font-quicksand" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.25, color: TEXT, margin: 0 }}>
        {p.nombre}
      </h3>
      <Excerpt text={p.excerpt} color="#6B5A2A" lines={2} />
    </div>
  </Link>
);

const OverlayCard = ({
  p,
  slotClass,
  label,
  baseBg,
  textColor,
  badgeBg,
  badgeColor,
}: {
  p: GardenPost;
  slotClass: string;
  label: string;
  baseBg: string;
  textColor: string;
  badgeBg: string;
  badgeColor: string;
}) => (
  <Link
    to={`/jardin/${p.slug}`}
    className={`cell ${slotClass}`}
    style={{
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      background: baseBg,
      textDecoration: "none",
      color: textColor,
      display: "block",
    }}
  >
    {p.coverUrl && (
      <img
        src={p.coverUrl}
        alt={p.nombre}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        loading="lazy"
      />
    )}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.4) 100%)",
      }}
    />
    <div style={{ position: "relative", padding: 12, display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
      <CategoryDate label={label} date={p.date} color={badgeColor} bg={badgeBg} dateColor={textColor} />
      <h3 className="font-quicksand" style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.25, color: textColor, margin: 0 }}>
        {p.nombre}
      </h3>
      <Excerpt text={p.excerpt} color={textColor} lines={2} />
    </div>
  </Link>
);

const DiarioCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="cell diario"
    style={{
      background: "transparent",
      border: `0.5px solid ${DIVIDER}`,
      borderRadius: 12,
      overflow: "hidden",
      textDecoration: "none",
      color: TEXT,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ flex: 1, overflow: "hidden", background: "#EAE6DE" }}>
      {p.coverUrl && (
        <img src={p.coverUrl} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
      )}
    </div>
    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      <CategoryDate label="Diario" date={p.date} color={TERRACOTA} bg={TERRACOTA_SOFT} />
      <h3 className="font-quicksand" style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.25, color: TERRACOTA, margin: 0 }}>
        {p.nombre}
      </h3>
    </div>
  </Link>
);

const BlogCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="cell blog"
    style={{
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      background: "#6B6B2A",
      textDecoration: "none",
      color: "#E8E8C0",
      display: "block",
    }}
  >
    {p.coverUrl && (
      <img
        src={p.coverUrl}
        alt={p.nombre}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        loading="lazy"
      />
    )}
    <div style={{ position: "absolute", inset: 0, background: "rgba(107,107,42,0.78)" }} />
    <div
      style={{
        position: "relative",
        padding: "0 16px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <CategoryDate label="Blog" date={p.date} color="#3A3A14" bg="#A0A060" dateColor="#E8E8C0" />
      <h3
        className="font-quicksand"
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#E8E8C0",
          margin: 0,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {p.nombre}
      </h3>
      <ArrowRight size={18} style={{ color: "#E8E8C0", flexShrink: 0 }} />
    </div>
  </Link>
);

// ---------- BENTO (dynamic feed) ----------
const renderCard = (p: GardenPost) => {
  const slot = slotOf(p);
  switch (slot) {
    case "resena":
      return <ResenaCard key={p.id} p={p} />;
    case "miosotis":
      return (
        <OverlayCard
          key={p.id}
          p={p}
          slotClass="miosotis"
          label="Miosotis"
          baseBg="#7B2D3E"
          textColor="#FAF0F2"
          badgeBg="rgba(255,255,255,0.2)"
          badgeColor="#FAF0F2"
        />
      );
    case "handcraft":
      return (
        <OverlayCard
          key={p.id}
          p={p}
          slotClass="handcraft"
          label="Handcraft"
          baseBg="#1C2B4A"
          textColor="#C8D8EE"
          badgeBg="rgba(139,163,199,0.35)"
          badgeColor="#C8D8EE"
        />
      );
    case "diario":
      return <DiarioCard key={p.id} p={p} />;
    case "blog":
      return <BlogCard key={p.id} p={p} />;
    default:
      return null;
  }
};

const Bento = ({ posts }: { posts: GardenPost[] }) => (
  <>
    <style>{`
      .bento-v2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 180px;
        grid-auto-flow: dense;
        gap: 8px;
      }
      .bento-v2 .cell      { grid-column: span 1; grid-row: span 1; }
      .bento-v2 .resena    { grid-column: span 1; grid-row: span 2; }
      .bento-v2 .miosotis  { grid-column: span 2; grid-row: span 1; }
      .bento-v2 .handcraft { grid-column: span 2; grid-row: span 1; }
      .bento-v2 .diario    { grid-column: span 1; grid-row: span 1; }
      .bento-v2 .blog      { grid-column: span 2; grid-row: span 1; }
      @media (min-width: 768px) {
        .bento-v2 { grid-template-columns: repeat(4, 1fr); }
        .bento-v2 .blog { grid-column: span 4; }
      }
      .no-bar::-webkit-scrollbar { display: none; }
    `}</style>
    <div className="bento-v2">
      {posts.map(renderCard)}
    </div>
  </>
);

const BentoSkeleton = () => (
  <div className="bento-v2">
    <div className="cell resena" style={{ background: "#EAE6DE", borderRadius: 12 }} />
    <div className="cell miosotis" style={{ background: "#EAE6DE", borderRadius: 12 }} />
    <div className="cell diario" style={{ background: "#EAE6DE", borderRadius: 12 }} />
    <div className="cell handcraft" style={{ background: "#EAE6DE", borderRadius: 12 }} />
    <div className="cell diario" style={{ background: "#EAE6DE", borderRadius: 12 }} />
    <div className="cell blog" style={{ background: "#EAE6DE", borderRadius: 12 }} />
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
      <Seo
        title="Lado B — Jardín digital de Karien Díaz Valdez"
        description="Un jardín digital de intereses, apuntes, reseñas y curiosidades personales de Karien Díaz Valdez, en crecimiento continuo."
        path="/lado-b"
      />
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

    </div>
  );
};

export default LadoB;
