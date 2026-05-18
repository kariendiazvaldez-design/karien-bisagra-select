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
  "Todos los formatos",
  "Apuntes",
  "Diario&Pensamientos",
  "Reseñas",
  "Log",
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

type Kind = "nota" | "recomendacion" | "log";

const tipoOf = (p: GardenPost): Kind => {
  const t = (p.tipo || "").toLowerCase();
  if (t.includes("log")) return "log";
  if (t.includes("recom") || t.includes("reseñ") || t.includes("resen")) return "recomendacion";
  return "nota";
};

const matchesTipoFilter = (p: GardenPost, filter: string) => {
  if (filter === "Todos los formatos") return true;
  const t = (p.tipo || "").toLowerCase();
  if (filter === "Apuntes") return t.includes("apunte") || t.includes("nota");
  if (filter === "Diario&Pensamientos") return t.includes("diario") || t.includes("pensam");
  if (filter === "Reseñas") return t.includes("reseñ") || t.includes("resen") || t.includes("recom");
  if (filter === "Log") return t.includes("log");
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
      <div
        className="flex-shrink-0 flex items-center justify-center font-quicksand"
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "#D9D9D9",
          color: "#7A7670",
          fontSize: 14,
        }}
      >
        Foto
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="font-caveat" style={{ color: TERRACOTA, fontSize: 48, lineHeight: 1, marginBottom: 16 }}>
          Karien.
        </h1>
        <p className="font-quicksand" style={{ fontSize: 16, color: "#444", lineHeight: 1.6, marginBottom: 16, maxWidth: 580, whiteSpace: "pre-line" }}>
          {"Lectora. Viajera. Nostálgica. Olvidadiza. Compañera de Falkor, perro Dragón\nQuiero escribir para recordar y para hacerme una casita fija mientras exploro todo lo que puedo."}
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

const NotaCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-5 flex flex-col gap-3 h-full"
    style={{ background: "#F3EDE8", color: TEXT, textDecoration: "none", borderRadius: 4 }}
  >
    <ImgPlaceholder h={200} />
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 22 }}>{maturityIcon(p.maturity)}</span>
      <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.25 }}>{p.nombre}</h3>
    </div>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 14, color: "#555", lineHeight: 1.55, flex: 1 }}>{p.excerpt}</p>}
    {p.temas.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {p.temas.slice(0, 4).map((t) => <Chip key={t}>{t}</Chip>)}
      </div>
    )}
    {p.date && <p style={{ color: TERRACOTA, fontSize: 13, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

const RecCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-5 flex flex-col gap-2 h-full"
    style={{ background: "#FFFFFF", border: `1px solid ${DIVIDER}`, color: TEXT, textDecoration: "none", borderRadius: 4 }}
  >
    <ImgPlaceholder h={160} />
    {p.category && (
      <p className="font-quicksand" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginTop: 4 }}>
        {p.category}
      </p>
    )}
    <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 14, color: "#777", lineHeight: 1.55, flex: 1 }}>{p.excerpt}</p>}
    {p.date && <p style={{ color: TERRACOTA, fontSize: 13, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

const LogCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-4 flex flex-col gap-2 h-full"
    style={{ background: TERRACOTA, color: "#FFFFFF", textDecoration: "none", borderRadius: 4, minHeight: 120 }}
  >
    <ImgPlaceholder h={80} bg={IMG_PH_DARK} />
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

// ---------- BENTO ----------
const bentoSpanClass = (kind: Kind) => {
  if (kind === "nota") return "col-span-1 md:col-span-2 md:row-span-2";
  if (kind === "recomendacion") return "col-span-1 md:row-span-2";
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
            {kind === "nota" && <NotaCard p={p} />}
            {kind === "recomendacion" && <RecCard p={p} />}
            {kind === "log" && <LogCard p={p} />}
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
  const [tipo, setTipo] = useState("Todos los formatos");
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
    </div>
  );
};

export default LadoB;
