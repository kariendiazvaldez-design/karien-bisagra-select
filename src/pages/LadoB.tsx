import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanityClient";
import { GARDEN_NOTES_QUERY, RECOMMENDATIONS_QUERY } from "@/lib/sanityQueries";
import DailyLog from "@/components/DailyLog";

// Palette
const C = {
  base: "#F5EDD6",
  text: "#5C4A1E",
  forest: "#3D5A3E",
  slate: "#2C4A52",
  terra: "#D4956A",
  mustard: "#E8B84B",
  light: "#F5EDD6",
  greenPlaceholder: "#A8C5A0",
};

const NAV_LINKS = [
  { label: "Jardín", href: "#jardin" },
  { label: "Recomendaciones", href: "#recomendaciones" },
  { label: "Log", href: "#log-cotidiano" },
];

const TOPICS = ["Todos los temas", "Comunidades", "Aprendizaje", "Museos", "Tecnología", "Personal"];
const FORMATS = ["Todos los formatos", "Nota", "Diario", "Reseña"];

type Maturity = "semilla" | "creciendo" | "madera";

type Note = { maturity: Maturity; format: string; title: string; desc: string; date?: string; image?: string };

const NOTES: Note[] = [
  { maturity: "creciendo", format: "Nota", title: "¿Qué hace que una comunidad esté viva?", desc: "Llevo semanas dando vueltas a esta pregunta. No es lo mismo una comunidad activa que una comunidad viva.", date: "Mayo 2025" },
  { maturity: "semilla", format: "Diario", title: "Primera semana con Obsidian", desc: "Todo se conecta con todo y eso me da miedo y alegría al mismo tiempo.", date: "Abril 2025" },
  { maturity: "madera", format: "Reseña", title: "Strategy is Your Words — Mark Pollard", desc: "Un libro sobre estrategia que se lee como poesía.", date: "Marzo 2025" },
  { maturity: "semilla", format: "Nota", title: "Museos y ciudadanía digital", desc: "¿Puede un museo construir identidad digital sin perder su identidad física?", date: "Marzo 2025" },
  { maturity: "creciendo", format: "Diario", title: "Sobre documentar el proceso", desc: "Documentar no es archivar. Es entender qué pasó mientras pasaba.", date: "Febrero 2025" },
];

const CATEGORIES = ["Libros", "Música", "Lugares", "Otros"];

type Rec = { category: string; title: string; author: string; desc: string; date?: string; image?: string };

const RECS: Rec[] = [
  { category: "Libros", title: "Strategy is Your Words", author: "Mark Pollard", desc: "Cambió cómo entiendo la estrategia y también cómo escribo.", date: "Mayo 2025" },
];

const maturityMeta: Record<Maturity, { label: string }> = {
  semilla: { label: "🌱 Semilla" },
  creciendo: { label: "🌿 Creciendo" },
  madera: { label: "🪵 Madera" },
};

const mapState = (s?: string): Maturity => {
  const v = (s || "").toLowerCase();
  if (v.includes("madera") || v.includes("ever")) return "madera";
  if (v.includes("creci") || v.includes("grow")) return "creciendo";
  return "semilla";
};

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Decorative organic separator — a wavy line + irregular blob in given color
const Separator = ({ color, flip = false }: { color: string; flip?: boolean }) => (
  <div
    aria-hidden
    className="w-full overflow-hidden"
    style={{ height: 60, transform: flip ? "scaleY(-1)" : undefined, lineHeight: 0 }}
  >
    <svg viewBox="0 0 1440 60" width="100%" height="60" preserveAspectRatio="none">
      <path
        d="M0,30 C240,5 480,55 720,30 C960,5 1200,55 1440,30 L1440,60 L0,60 Z"
        fill={color}
      />
      <circle cx="220" cy="22" r="6" fill={color} opacity="0.85" />
      <circle cx="1180" cy="18" r="9" fill={color} opacity="0.7" />
      <ellipse cx="900" cy="14" rx="14" ry="6" fill={color} opacity="0.6" />
    </svg>
  </div>
);

const LadoB = () => {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [format, setFormat] = useState(FORMATS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sanityNotes, setSanityNotes] = useState<Note[] | null>(null);
  const [sanityRecs, setSanityRecs] = useState<Rec[] | null>(null);

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
              date: n.date,
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
              date: r.date,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const notes = sanityNotes ?? NOTES;
  const recs = sanityRecs ?? RECS;

  const lightBorder = "0.5px solid rgba(245, 237, 214, 0.3)";
  const darkBorder = "0.5px solid rgba(92, 74, 30, 0.3)";

  return (
    <div className="lado-b font-quicksand min-h-screen" style={{ background: C.base, color: C.text }}>
      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-40"
        style={{ background: C.text, borderBottom: lightBorder }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium" style={{ color: C.light }}>Karien.xyz</Link>
          <div className="hidden md:flex gap-8 text-sm" style={{ color: C.light, opacity: 0.85 }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:opacity-100 transition-opacity">
                {l.label}
              </a>
            ))}
          </div>
          <Link to="/lado-a" className="hidden md:inline text-sm transition-opacity hover:opacity-100" style={{ color: C.mustard }}>
            Lado A →
          </Link>
          <button className="md:hidden text-xl" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú" style={{ color: C.light }}>···</button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 py-4 flex flex-col gap-3" style={{ borderTop: lightBorder, background: C.text }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: C.light }}>{l.label}</a>
            ))}
            <Link to="/lado-a" style={{ color: C.mustard }}>Lado A →</Link>
          </div>
        )}
      </nav>

      {/* HERO — compacto */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 md:px-20"
        style={{ background: C.text, color: C.light, paddingTop: 96, paddingBottom: 80 }}
      >
        <p className="font-caveat mb-4" style={{ color: C.mustard, fontSize: 22 }}>
          bienvenida al jardín 🌿
        </p>
        <h1
          className="font-caveat mx-auto mb-6"
          style={{ fontWeight: 400, fontSize: "clamp(48px, 7vw, 72px)", maxWidth: 820, lineHeight: 1.1, color: C.light }}
        >
          Un espacio para{" "}
          <span style={{ borderBottom: `4px solid ${C.mustard}`, paddingBottom: 2 }}>curiosear</span>{" "}
          en{" "}
          <span style={{ borderBottom: `4px solid ${C.mustard}`, paddingBottom: 2 }}>voz alta</span>.
        </h1>
        <p className="font-quicksand mx-auto mb-6" style={{ maxWidth: 540, color: C.light, opacity: 0.8, fontSize: "clamp(15px, 1.2vw, 17px)", lineHeight: 1.6 }}>
          Notas en proceso, intereses en curso y pensamientos que me tienen capturada. No todo está terminado y ya me acostumbré.
        </p>
        <p className="font-caveat" style={{ color: C.mustard, fontSize: 18 }}>
          {notes.length} notas · {notes.filter(n => n.maturity === "semilla").length} semillas · {notes.filter(n => n.maturity === "madera").length} madera
        </p>
      </section>

      {/* separador hero -> jardín */}
      <Separator color={C.forest} />

      {/* JARDÍN */}
      <section
        id="jardin"
        className="px-6 md:px-20"
        style={{ background: C.forest, color: C.light, paddingTop: 120, paddingBottom: 140 }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="font-caveat mb-3" style={{ color: C.mustard, fontSize: 22 }}>el jardín</p>
          <h2 className="font-caveat mb-10" style={{ fontWeight: 400, fontSize: "clamp(40px, 5vw, 56px)", color: C.light, lineHeight: 1.1 }}>
            Notas e ideas
          </h2>

          <div className="flex flex-wrap gap-2 mb-3">
            {TOPICS.map((t) => {
              const active = topic === t;
              return (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-4 py-2 text-sm transition-colors font-quicksand"
                  style={{
                    border: lightBorder,
                    background: active ? C.mustard : "transparent",
                    color: active ? C.text : C.light,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mb-12">
            {FORMATS.map((f) => {
              const active = format === f;
              return (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="px-4 py-2 text-sm transition-colors font-quicksand"
                  style={{
                    border: lightBorder,
                    background: active ? C.mustard : "transparent",
                    color: active ? C.text : C.light,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notes.map((n, i) => {
              const meta = maturityMeta[n.maturity];
              return (
                <article
                  key={i}
                  className="flex flex-col"
                  style={{ border: lightBorder, background: "rgba(245, 237, 214, 0.04)" }}
                >
                  {/* Imagen / placeholder 3:2 */}
                  <div style={{ aspectRatio: "3 / 2", background: n.image ? undefined : C.greenPlaceholder, overflow: "hidden" }}>
                    {n.image ? (
                      <img src={n.image} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>
                  <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span style={{ color: C.mustard, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {meta.label}
                      </span>
                      <span style={{ color: C.terra, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                        {n.format}
                      </span>
                    </div>
                    <h3 className="font-quicksand" style={{ color: C.light, fontWeight: 600, fontSize: 17, marginBottom: 10, lineHeight: 1.3 }}>
                      {n.title}
                    </h3>
                    <p className="font-quicksand" style={{ color: C.light, opacity: 0.8, fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}>
                      {n.desc}
                    </p>
                    {n.date && (
                      <p className="font-caveat" style={{ color: C.mustard, fontSize: 17, marginTop: "auto" }}>
                        {n.date}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* separador jardín -> recomendaciones */}
      <Separator color={C.terra} />

      {/* RECOMENDACIONES */}
      <section
        id="recomendaciones"
        className="px-6 md:px-20"
        style={{ background: C.terra, color: C.text, paddingTop: 120, paddingBottom: 140 }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="font-caveat mb-3" style={{ color: C.text, opacity: 0.8, fontSize: 22 }}>cosas que me gustan</p>
          <h2 className="font-caveat mb-10" style={{ fontWeight: 400, fontSize: "clamp(40px, 5vw, 56px)", color: C.text, lineHeight: 1.1 }}>
            Recomendaciones
          </h2>

          <div className="flex flex-wrap gap-2 mb-12">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-4 py-2 text-sm transition-colors font-quicksand"
                  style={{
                    border: darkBorder,
                    background: active ? C.text : "transparent",
                    color: active ? C.light : C.text,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-6">
            {recs.map((r, i) => (
              <article
                key={i}
                className="flex flex-col md:flex-row"
                style={{ border: darkBorder, background: "rgba(92, 74, 30, 0.05)" }}
              >
                {/* Cover cuadrado */}
                <div
                  style={{
                    width: 160,
                    minWidth: 160,
                    aspectRatio: "1 / 1",
                    background: r.image ? undefined : C.forest,
                    overflow: "hidden",
                  }}
                  className="md:w-[180px] md:min-w-[180px]"
                >
                  {r.image ? (
                    <img src={r.image} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : null}
                </div>
                <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                  <p style={{ color: C.text, opacity: 0.65, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>
                    {r.category}
                  </p>
                  <h3 className="font-quicksand" style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: C.text }}>
                    {r.title} <span style={{ color: C.text, opacity: 0.7, fontWeight: 400 }}>— {r.author}</span>
                  </h3>
                  <p className="font-quicksand" style={{ color: C.text, opacity: 0.85, fontSize: 14, lineHeight: 1.55, marginBottom: 12 }}>
                    {r.desc}
                  </p>
                  {r.date && (
                    <p className="font-caveat" style={{ color: C.text, opacity: 0.7, fontSize: 17, marginTop: "auto" }}>
                      {r.date}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* separador recomendaciones -> log */}
      <Separator color={C.slate} />

      {/* LOG COTIDIANO */}
      <DailyLog />

      {/* separador log -> footer */}
      <Separator color={C.text} />

      {/* FOOTER */}
      <footer
        className="px-6 md:px-20 text-center"
        style={{ background: C.text, color: C.light, paddingTop: 80, paddingBottom: 80 }}
      >
        <p className="font-caveat mb-3" style={{ color: C.mustard, fontSize: 22 }}>
          Jardín regado por última vez: 4 de mayo de 2025 🌿
        </p>
        <p className="font-quicksand mb-8" style={{ color: C.light, opacity: 0.7, fontSize: 13 }}>
          Un espacio en construcción permanente.
        </p>
        <Link to="/lado-a" className="inline-block mb-8 font-quicksand" style={{ color: C.mustard, fontSize: 14, fontWeight: 500 }}>
          ← Ir a Lado A
        </Link>
        <p className="font-quicksand" style={{ color: C.light, opacity: 0.6, fontSize: 12 }}>
          Karien.xyz · Este espacio no está terminado intencionalmente.
        </p>
      </footer>
    </div>
  );
};

export default LadoB;
