import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BG = "#F2EFE8";
const TERRACOTA = "#C4622D";
const TEXT = "#1C1A17";
const DIVIDER = "#E8E8E8";

const TIPO_OPTS = ["Todo", "Nota", "Recomendación", "Log"];
const CHIPS_HERO = [
  "Diseño de servicios",
  "UX Research",
  "Facilitación",
  "Transformación digital",
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

const tipoOf = (p: GardenPost): "nota" | "recomendacion" | "log" => {
  const t = (p.tipo || "").toLowerCase();
  if (t.includes("log")) return "log";
  if (t.includes("recom")) return "recomendacion";
  return "nota";
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
        <h1 className="font-caveat" style={{ color: TERRACOTA, fontSize: 48, lineHeight: 1, marginBottom: 12 }}>
          Karien.
        </h1>
        <p className="font-quicksand" style={{ fontSize: 16, color: "#444", lineHeight: 1.6, marginBottom: 16, maxWidth: 560 }}>
          Diseñadora de servicios. Comunicadora de formación. Curiosa por vocación.
        </p>
        <div className="flex items-center justify-center md:justify-start gap-2 mb-5 font-quicksand" style={{ fontSize: 14, color: TEXT }}>
          <MapPin size={14} style={{ color: TERRACOTA }} />
          <span>Chiclayo · Lima · Remoto</span>
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {CHIPS_HERO.map((c) => (
            <span
              key={c}
              className="font-quicksand"
              style={{
                fontSize: 13,
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${TERRACOTA}`,
                color: TERRACOTA,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ---------- FILTER CHIPS ----------
const FilterChips = ({
  options,
  active,
  onSelect,
}: {
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) => (
  <div
    className="flex gap-2 overflow-x-auto md:flex-wrap"
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
  >
    <style>{`.no-bar::-webkit-scrollbar{display:none}`}</style>
    <div className="flex gap-2 md:flex-wrap no-bar">
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="font-quicksand whitespace-nowrap transition-colors"
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid ${TERRACOTA}`,
              background: isActive ? TERRACOTA : "transparent",
              color: isActive ? "#FFFFFF" : TERRACOTA,
              flexShrink: 0,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
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

const NotaCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-6 flex flex-col gap-3"
    style={{ background: "#F3EDE8", color: TEXT, textDecoration: "none", borderRadius: 4, minHeight: 200 }}
  >
    <span style={{ fontSize: 24 }}>{maturityIcon(p.maturity)}</span>
    <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.25 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 14, color: "#555", lineHeight: 1.55, flex: 1 }}>{p.excerpt}</p>}
    {p.temas.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {p.temas.slice(0, 4).map((t) => <Chip key={t}>{t}</Chip>)}
      </div>
    )}
    {p.date && <p style={{ color: TERRACOTA, fontSize: 13, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

const RecCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-5 flex flex-col gap-2"
    style={{ background: "#FFFFFF", border: `1px solid ${DIVIDER}`, color: TEXT, textDecoration: "none", borderRadius: 4 }}
  >
    {p.category && (
      <p className="font-quicksand" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase" }}>
        {p.category}
      </p>
    )}
    <h3 className="font-quicksand" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{p.nombre}</h3>
    {p.excerpt && <p className="font-quicksand" style={{ fontSize: 14, color: "#777", lineHeight: 1.55, flex: 1 }}>{p.excerpt}</p>}
    {p.temas.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {p.temas.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}
      </div>
    )}
    {p.date && <p style={{ color: TERRACOTA, fontSize: 13, marginTop: "auto" }} className="font-quicksand">{fmtDate(p.date)}</p>}
  </Link>
);

const LogCard = ({ p }: { p: GardenPost }) => (
  <Link
    to={`/jardin/${p.slug}`}
    className="p-4 flex flex-col gap-2 justify-between"
    style={{ background: TERRACOTA, color: "#FFFFFF", textDecoration: "none", borderRadius: 4, minHeight: 120 }}
  >
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
const bentoSpanClass = (kind: "nota" | "recomendacion" | "log") => {
  if (kind === "nota") return "col-span-1 md:col-span-2 md:row-span-2";
  if (kind === "recomendacion") return "col-span-1 md:row-span-2";
  return "col-span-1";
};

const Bento = ({ posts }: { posts: GardenPost[] }) => (
  <div
    className="grid gap-4"
    style={{ gridTemplateColumns: "1fr", gridAutoRows: "minmax(120px, auto)" }}
  >
    <style>{`
      @media (min-width: 768px) {
        .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (min-width: 1024px) {
        .bento-grid { grid-template-columns: repeat(4, 1fr) !important; }
      }
    `}</style>
    <div className="bento-grid grid gap-4 col-span-1" style={{ gridTemplateColumns: "1fr", gridAutoRows: "minmax(120px, auto)" }}>
      {posts.map((p) => {
        const kind = tipoOf(p);
        const cls = bentoSpanClass(kind);
        return (
          <div key={p.id} className={cls}>
            {kind === "nota" && <NotaCard p={p} />}
            {kind === "recomendacion" && <RecCard p={p} />}
            {kind === "log" && <LogCard p={p} />}
          </div>
        );
      })}
    </div>
  </div>
);

const BentoSkeleton = () => (
  <div className="bento-grid grid gap-4" style={{ gridTemplateColumns: "1fr", gridAutoRows: "minmax(120px, auto)" }}>
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
  const [tipo, setTipo] = useState("Todo");
  const [tema, setTema] = useState("Todo");

  const temas = useMemo(() => {
    const s = new Set<string>(["Todo"]);
    posts.forEach((p) => p.temas.forEach((t) => t && s.add(t)));
    return Array.from(s);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const kind = tipoOf(p);
      const tipoOk =
        tipo === "Todo" ||
        (tipo === "Nota" && kind === "nota") ||
        (tipo === "Recomendación" && kind === "recomendacion") ||
        (tipo === "Log" && kind === "log");
      const temaOk = tema === "Todo" || p.temas.includes(tema);
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
          <div className="flex flex-col gap-3 mb-8">
            <FilterChips options={TIPO_OPTS} active={tipo} onSelect={setTipo} />
            <FilterChips options={temas} active={tema} onSelect={setTema} />
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
