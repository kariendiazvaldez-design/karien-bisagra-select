import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanityClient";
import { GARDEN_NOTES_QUERY, INTERESTS_QUERY, RECOMMENDATIONS_QUERY } from "@/lib/sanityQueries";

const NAV_LINKS = [
  { label: "Jardín", href: "#jardin" },
  { label: "Intereses", href: "#intereses" },
  { label: "Recomendaciones", href: "#recomendaciones" },
];

const TOPICS = ["Todos los temas", "Comunidades", "Aprendizaje", "Museos", "Tecnología", "Personal"];
const FORMATS = ["Todos los formatos", "Nota", "Diario", "Reseña"];

type Maturity = "semilla" | "creciendo" | "madera";

const NOTES: { maturity: Maturity; format: string; title: string; desc: string }[] = [
  {
    maturity: "creciendo",
    format: "Nota",
    title: "¿Qué hace que una comunidad esté viva?",
    desc: "Llevo semanas dando vueltas a esta pregunta. No es lo mismo una comunidad activa que una comunidad viva.",
  },
  {
    maturity: "semilla",
    format: "Diario",
    title: "Primera semana con Obsidian",
    desc: "Todo se conecta con todo y eso me da miedo y alegría al mismo tiempo.",
  },
  {
    maturity: "madera",
    format: "Reseña",
    title: "Strategy is Your Words — Mark Pollard",
    desc: "Un libro sobre estrategia que se lee como poesía.",
  },
  {
    maturity: "semilla",
    format: "Nota",
    title: "Museos y ciudadanía digital",
    desc: "¿Puede un museo construir identidad digital sin perder su identidad física?",
  },
  {
    maturity: "creciendo",
    format: "Diario",
    title: "Sobre documentar el proceso",
    desc: "Documentar no es archivar. Es entender qué pasó mientras pasaba.",
  },
];

const INTERESTS = [
  {
    title: "Transformación digital en museos",
    desc: "Mi nueva fijación. ¿Qué se puede esperar de los museos? ¿Cómo construyen ciudadanía?",
    state: "activo",
  },
  {
    title: "Arquitectura de información",
    desc: "¿Dónde la información se convierte en aprendizaje? Sigo sin tener respuesta.",
    state: "en proceso",
  },
  {
    title: "Jardines digitales como práctica",
    desc: "Estoy viviendo el experimento mientras lo estudio.",
    state: "activo",
  },
];

const CATEGORIES = ["Libros", "Música", "Lugares", "Otros"];

const RECS = [
  {
    category: "Libros",
    title: "Strategy is Your Words",
    author: "Mark Pollard",
    desc: "Cambió cómo entiendo la estrategia y también cómo escribo.",
  },
];

const maturityStyles: Record<Maturity, { border: string; bg: string; titleColor: string; titleWeight: string; label: string }> = {
  semilla: {
    border: "0.5px solid #D4916A",
    bg: "#F2EFE8",
    titleColor: "#6B6660",
    titleWeight: "500",
    label: "🌱 Semilla",
  },
  creciendo: {
    border: "1px solid #C4622D",
    bg: "#FAF6F0",
    titleColor: "#1C1A17",
    titleWeight: "500",
    label: "🌿 Creciendo",
  },
  madera: {
    border: "1.5px solid #8B3A1A",
    bg: "#F5EDE4",
    titleColor: "#1C1A17",
    titleWeight: "600",
    label: "🪵 Madera",
  },
};

const mapState = (s?: string): Maturity => {
  const v = (s || "").toLowerCase();
  if (v.includes("madera") || v.includes("ever")) return "madera";
  if (v.includes("creci") || v.includes("grow")) return "creciendo";
  return "semilla";
};

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const LadoB = () => {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [format, setFormat] = useState(FORMATS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sanityNotes, setSanityNotes] = useState<typeof NOTES | null>(null);
  const [sanityInterests, setSanityInterests] = useState<typeof INTERESTS | null>(null);
  const [sanityRecs, setSanityRecs] = useState<typeof RECS | null>(null);

  useEffect(() => {
    sanityClient
      .fetch(GARDEN_NOTES_QUERY)
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSanityNotes(
            data.map((n) => ({
              maturity: mapState(n.state),
              format: capitalize(n.format || "Nota"),
              title: n.title || "",
              desc: Array.isArray(n.topics) ? n.topics.join(" · ") : "",
            }))
          );
        }
      })
      .catch(() => {});

    sanityClient
      .fetch(INTERESTS_QUERY)
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSanityInterests(
            data.map((it) => ({
              title: it.name || "",
              desc: it.why || "",
              state: it.status || "activo",
            }))
          );
        }
      })
      .catch(() => {});

    sanityClient
      .fetch(RECOMMENDATIONS_QUERY)
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSanityRecs(
            data.map((r) => ({
              category: r.category || "Otros",
              title: r.title || "",
              author: r.author || "",
              desc: r.description || "",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const notes = sanityNotes ?? NOTES;
  const interests = sanityInterests ?? INTERESTS;
  const recs = sanityRecs ?? RECS;

  return (
    <div className="lado-b font-quicksand min-h-screen" style={{ background: "#F2EFE8", color: "#1C1A17" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40" style={{ background: "#F2EFE8", borderBottom: "0.5px solid #D4CFC5" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium" style={{ color: "#1C1A17" }}>Karien.xyz</Link>
          <div className="hidden md:flex gap-8 text-sm" style={{ color: "#6B6660" }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:opacity-70 transition-opacity">
                {l.label}
              </a>
            ))}
          </div>
          <Link to="/lado-a" className="hidden md:inline text-sm transition-opacity hover:opacity-70" style={{ color: "#D4916A" }}>
            Lado A →
          </Link>
          <button className="md:hidden text-xl" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">···</button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 py-4 flex flex-col gap-3" style={{ borderTop: "0.5px solid #D4CFC5" }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: "#6B6660" }}>{l.label}</a>
            ))}
            <Link to="/lado-a" style={{ color: "#D4916A" }}>Lado A →</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-20 pt-16">
        <p className="font-caveat mb-6" style={{ color: "#C4622D", fontSize: "20px" }}>
          bienvenida al jardín 🌿
        </p>
        <h1
          className="font-quicksand mx-auto mb-8"
          style={{ fontWeight: 600, fontSize: "clamp(40px, 6vw, 64px)", maxWidth: 680, lineHeight: 1.1, color: "#1C1A17" }}
        >
          Un espacio para curiosear en voz alta.
        </h1>
        <p className="mx-auto mb-8" style={{ maxWidth: 520, color: "#6B6660", fontSize: "clamp(16px, 1.2vw, 18px)", lineHeight: 1.6 }}>
          Notas en proceso, intereses en curso y pensamientos que me tienen capturados. No todo está terminado y ya me acostumbré.
        </p>
        <p style={{ color: "#6B6660", fontSize: 14, fontWeight: 500 }}>
          5 notas · 2 semillas · 1 madera
        </p>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xl animate-pulse-soft" style={{ color: "#D4916A" }}>↓</div>
      </section>

      {/* JARDÍN */}
      <section id="jardin" className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <p className="font-caveat mb-3" style={{ color: "#C4622D", fontSize: 20 }}>el jardín</p>
          <h2 className="mb-8" style={{ fontWeight: 600, fontSize: 36 }}>Notas e ideas</h2>

          <div className="flex flex-wrap gap-2 mb-3">
            {TOPICS.map((t) => {
              const active = topic === t;
              return (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    border: "0.5px solid #D4916A",
                    background: active ? "#C4622D" : "transparent",
                    color: active ? "#F2EFE8" : "#6B6660",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mb-10">
            {FORMATS.map((f) => {
              const active = format === f;
              return (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    border: "0.5px solid #D4916A",
                    background: active ? "#C4622D" : "transparent",
                    color: active ? "#F2EFE8" : "#6B6660",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notes.map((n, i) => {
              const s = maturityStyles[n.maturity];
              return (
                <article key={i} className="p-5 flex flex-col" style={{ border: s.border, background: s.bg }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ color: "#6B7A52", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {s.label}
                    </span>
                    <span style={{ color: "#D4916A", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                      {n.format}
                    </span>
                  </div>
                  <h3 style={{ color: s.titleColor, fontWeight: s.titleWeight, fontSize: 17, marginBottom: 8 }}>{n.title}</h3>
                  <p style={{ color: "#6B6660", fontSize: 14, lineHeight: 1.5 }}>{n.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERESES */}
      <section id="intereses" className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <p className="font-caveat mb-3" style={{ color: "#C4622D", fontSize: 20 }}>en qué ando</p>
          <h2 className="mb-10" style={{ fontWeight: 600, fontSize: 36 }}>Intereses activos</h2>
          <div>
            {INTERESTS.map((it, i) => {
              const isActive = it.state === "activo";
              return (
                <div
                  key={i}
                  className="py-6 pl-5"
                  style={{
                    borderBottom: i < INTERESTS.length - 1 ? "0.5px solid #D4CFC5" : undefined,
                    borderLeft: `2px solid ${isActive ? "#C4622D" : "#D4916A"}`,
                  }}
                >
                  <h3 style={{ fontWeight: 500, fontSize: 17, color: "#1C1A17", marginBottom: 6 }}>{it.title}</h3>
                  <p style={{ color: "#6B6660", fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>{it.desc}</p>
                  <span style={{ color: "#C4622D", fontSize: 12, fontWeight: 500 }}>{it.state} →</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RECOMENDACIONES */}
      <section id="recomendaciones" className="px-6 md:px-20 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <p className="font-caveat mb-3" style={{ color: "#C4622D", fontSize: 20 }}>cosas que me gustan</p>
          <h2 className="mb-8" style={{ fontWeight: 600, fontSize: 36 }}>Recomendaciones</h2>

          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    border: "0.5px solid #D4916A",
                    background: active ? "#C4622D" : "transparent",
                    color: active ? "#F2EFE8" : "#6B6660",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div>
            {RECS.map((r, i) => (
              <div
                key={i}
                className="py-6"
                style={{ borderBottom: "0.5px solid #D4CFC5", borderTop: i === 0 ? "0.5px solid #D4CFC5" : undefined }}
              >
                <p style={{ color: "#D4916A", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
                  {r.category}
                </p>
                <h3 style={{ fontWeight: 500, fontSize: 16, marginBottom: 6 }}>
                  {r.title} — <span style={{ color: "#6B6660" }}>{r.author}</span>
                </h3>
                <p style={{ color: "#6B6660", fontSize: 14, lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-20 py-16 text-center" style={{ borderTop: "0.5px solid #D4CFC5" }}>
        <p className="font-caveat mb-3" style={{ color: "#D4916A", fontSize: 18 }}>
          Jardín regado por última vez: 4 de mayo de 2025 🌿
        </p>
        <p className="mb-6" style={{ color: "#8C9970", fontSize: 13 }}>
          Un espacio en construcción permanente.
        </p>
        <Link to="/lado-a" className="inline-block mb-8" style={{ color: "#C4622D", fontSize: 14, fontWeight: 500 }}>
          ← Ir a Lado A
        </Link>
        <p style={{ color: "#8C9970", fontSize: 12 }}>
          Karien.xyz · Este espacio no está terminado intencionalmente.
        </p>
      </footer>
    </div>
  );
};

export default LadoB;
