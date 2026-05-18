import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const BORDER_FAINT = "0.5px solid rgba(28, 26, 23, 0.15)";
const TERRACOTA = "#C4622D";

const maturityIcon = (m: string) => {
  const k = m.toLowerCase();
  if (k.includes("semilla")) return "🌱";
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

export const FilterRow = ({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) => (
  <div>
    <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: 8 }}>
      {label}
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="px-3 py-1.5 text-sm transition-colors"
            style={{
              border: `1px solid ${TERRACOTA}`,
              backgroundColor: isActive ? TERRACOTA : "transparent",
              color: isActive ? "#FFFFFF" : TERRACOTA,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

export const GardenCard = ({ p }: { p: GardenPost }) => {
  const tipo = (p.tipo || "").toLowerCase();
  if (tipo.includes("log")) {
    return (
      <article className="p-5 flex flex-col gap-3 mb-4" style={{ border: BORDER_FAINT, background: "#FAFAF8", breakInside: "avoid" }}>
        <p className="font-caveat" style={{ color: TERRACOTA, fontSize: 26, lineHeight: 1.1 }}>{fmtDate(p.date)}</p>
        <p style={{ color: "#1C1A17", fontSize: 15, lineHeight: 1.55 }}>{p.excerpt || p.nombre}</p>
        {p.maturity && (
          <span className="self-start px-2 py-1 font-caveat" style={{ color: TERRACOTA, border: `0.5px solid ${TERRACOTA}`, fontSize: 14 }}>
            {p.maturity}
          </span>
        )}
      </article>
    );
  }
  if (tipo.includes("recom")) {
    return (
      <article className="p-5 flex flex-col gap-2 mb-4" style={{ border: BORDER_FAINT, background: "#FAFAF8", breakInside: "avoid" }}>
        {p.category && (
          <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase" }}>{p.category}</p>
        )}
        <h3 style={{ fontWeight: 600, fontSize: 17, color: "#1C1A17", lineHeight: 1.3 }}>{p.nombre}</h3>
        {p.excerpt && <p style={{ color: "#1C1A17", opacity: 0.7, fontSize: 14, lineHeight: 1.55 }}>{p.excerpt}</p>}
        {p.temas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {p.temas.map((t) => (
              <span key={t} className="px-2 py-0.5 text-xs" style={{ border: `0.5px solid ${TERRACOTA}`, color: TERRACOTA }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </article>
    );
  }
  // Nota (default)
  return (
    <article className="p-5 flex flex-col gap-2 mb-4" style={{ border: BORDER_FAINT, background: "#FAFAF8", breakInside: "avoid" }}>
      <p className="font-caveat" style={{ color: TERRACOTA, fontSize: 20 }}>
        {maturityIcon(p.maturity)} {p.maturity || "semilla"}
      </p>
      <h3 style={{ fontWeight: 600, fontSize: 17, color: "#1C1A17", lineHeight: 1.3 }}>{p.nombre}</h3>
      {p.excerpt && <p style={{ color: "#1C1A17", opacity: 0.7, fontSize: 14, lineHeight: 1.55 }}>{p.excerpt}</p>}
      <p className="font-caveat mt-2" style={{ color: TERRACOTA, fontSize: 16 }}>{fmtDate(p.date)}</p>
    </article>
  );
};

const TIPO_OPTS = ["Todo", "Nota", "Recomendación", "Log"];
const MAT_OPTS = ["Todo", "Semilla", "Brote", "Fruto"];

export function useGardenPosts() {
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

export function useGardenFilters(posts: GardenPost[]) {
  const [tipo, setTipo] = useState("Todo");
  const [mat, setMat] = useState("Todo");
  const [tema, setTema] = useState("Todo");

  const temas = useMemo(() => {
    const s = new Set<string>(["Todo"]);
    posts.forEach((p) => p.temas.forEach((t) => t && s.add(t)));
    return Array.from(s);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const tipoOk = tipo === "Todo" || (p.tipo || "").toLowerCase().includes(tipo.toLowerCase().slice(0, 4));
      const matOk = mat === "Todo" || (p.maturity || "").toLowerCase() === mat.toLowerCase();
      const temaOk = tema === "Todo" || p.temas.includes(tema);
      return tipoOk && matOk && temaOk;
    });
  }, [posts, tipo, mat, tema]);

  return { tipo, setTipo, mat, setMat, tema, setTema, temas, filtered };
}

export const GardenSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="p-5 mb-4" style={{ border: BORDER_FAINT, background: "#FAFAF8", breakInside: "avoid" }}>
        <div className="h-3 w-20 bg-[#E8E8E8] mb-3" />
        <div className="h-4 w-3/4 bg-[#E8E8E8] mb-3" />
        <div className="h-3 w-full bg-[#E8E8E8] mb-2" />
        <div className="h-3 w-5/6 bg-[#E8E8E8]" />
      </div>
    ))}
  </>
);

const Jardin = () => {
  const { posts, loading } = useGardenPosts();
  const { tipo, setTipo, mat, setMat, tema, setTema, temas, filtered } = useGardenFilters(posts);

  return (
    <div className="font-quicksand min-h-screen" style={{ background: "#FAFAF8", color: "#1C1A17" }}>
      <nav className="fixed top-0 left-0 right-0 z-40" style={{ background: "#FAFAF8", borderBottom: BORDER_FAINT }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium" style={{ color: "#1C1A17" }}>Karien.xyz</Link>
          <Link to="/lado-b" style={{ color: TERRACOTA, fontSize: 14 }}>← Lado B</Link>
        </div>
      </nav>

      <section className="pt-28 md:pt-32 pb-12 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <h1 style={{ fontWeight: 700, fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.1, color: "#1C1A17", marginBottom: 16 }}>
            El jardín
          </h1>
          <p style={{ color: "#999", fontSize: 16 }}>Notas, recomendaciones y logs</p>

          <div className="flex flex-col gap-4 mt-10 mb-10">
            <FilterRow label="Tipo" options={TIPO_OPTS} active={tipo} onSelect={setTipo} />
            <FilterRow label="Madurez" options={MAT_OPTS} active={mat} onSelect={setMat} />
            <FilterRow label="Temas" options={temas} active={tema} onSelect={setTema} />
          </div>

          <div style={{ columnCount: 3, columnGap: 16 }} className="garden-cols">
            {loading ? (
              <GardenSkeleton />
            ) : filtered.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center", gridColumn: "1/-1" }}>Nada por aquí todavía</p>
            ) : (
              filtered.map((p) => <GardenCard key={p.id} p={p} />)
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1023px) { .garden-cols { column-count: 2 !important; } }
        @media (max-width: 639px) { .garden-cols { column-count: 1 !important; } }
      `}</style>
    </div>
  );
};

export default Jardin;
