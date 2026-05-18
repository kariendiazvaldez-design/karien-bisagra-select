import { Link } from "react-router-dom";
import { useState } from "react";
import {
  useGardenPosts,
  useGardenFilters,
  FilterRow,
  GardenCard,
  GardenSkeleton,
} from "@/pages/Jardin";

const TIPO_OPTS = ["Todo", "Nota", "Recomendación", "Log"];
const MAT_OPTS = ["Todo", "Semilla", "Brote", "Fruto"];

const NAV_LINKS = [
  { label: "Sobre mí", href: "#about" },
  { label: "Jardín", href: "#jardin" },
];

// ---------- TYPES ----------
type PhotoItem = { color: string; src?: string; alt?: string };
type CollageItem = { color: string; src?: string; alt?: string; caption?: string; size: "lg" | "sm"; offset?: boolean };

type NoteEntry = {
  kind: "nota";
  maturity: "semilla" | "brote" | "fruto";
  title: string;
  excerpt: string;
  date: string;
  imageColor?: string;
  imageSrc?: string;
};
type RecEntry = {
  kind: "recomendacion";
  type: string;
  title: string;
  author?: string;
  review: string;
  rating: string;
  imageColor?: string;
  imageSrc?: string;
};
type LogEntry = {
  kind: "log";
  date: string;
  text: string;
  mood: string;
};

type GardenEntry = NoteEntry | RecEntry | LogEntry;

// ---------- DATA (placeholders) ----------
const HERO_PHOTOS: PhotoItem[] = [
  { color: "#D4B896" },
  { color: "#C4956A" },
  { color: "#8B7355" },
  { color: "#A8C5A0" },
  { color: "#2C4A52" },
  { color: "#D4B896" },
];

const COLLAGE: CollageItem[] = [
  { color: "#C4956A", size: "lg", caption: "mayo 2025" },
  { color: "#A8C5A0", size: "sm", offset: true },
];

const FIND_LIST = [
  "Notas en proceso, semillas que aún no son ideas",
  "Recomendaciones de libros, música y lugares",
  "Textos más cuidados, para no olvidarme de lo que importa",
  "Fragmentos de proyectos paralelos",
];

const GARDEN_ENTRIES: GardenEntry[] = [
  {
    kind: "nota",
    maturity: "brote",
    title: "¿Qué hace que una comunidad esté viva?",
    excerpt: "Llevo semanas dando vueltas a esta pregunta. Una comunidad activa no es lo mismo que una viva.",
    date: "12 mayo 2025",
    imageColor: "#A8C5A0",
  },
  {
    kind: "nota",
    maturity: "semilla",
    title: "Museos y ciudadanía digital",
    excerpt: "¿Puede un museo construir identidad digital sin perder la física?",
    date: "3 mayo 2025",
    imageColor: "#D4B896",
  },
  {
    kind: "recomendacion",
    type: "Libro",
    title: "Strategy is Your Words",
    author: "Mark Pollard",
    review: "Cambió cómo entiendo la estrategia y también cómo escribo.",
    rating: "★★★★★",
    imageColor: "#8B7355",
  },
  {
    kind: "recomendacion",
    type: "Lugar",
    title: "Café del jardín botánico",
    author: "CDMX",
    review: "Mesa al fondo, luz de las 4pm, té de jamaica. Mi oficina honoraria.",
    rating: "★★★★",
    imageColor: "#A8C5A0",
  },
  {
    kind: "log",
    date: "10 mayo 2025",
    text: "Mapeé los flujos de la nueva plataforma. Costó pero quedaron claros.",
    mood: "concentrada",
  },
  {
    kind: "log",
    date: "7 mayo 2025",
    text: "Releí un capítulo de arquitectura de información. Vuelve a tener sentido.",
    mood: "curiosa",
  },
];

const TABS = ["Todo", "Notas", "Recomendaciones", "Log"] as const;
type Tab = (typeof TABS)[number];

const BORDER_FAINT = "0.5px solid rgba(28, 26, 23, 0.15)";
const BORDER_DARK = "0.5px solid #1C1A17";

// ---------- COMPONENTS ----------
const PhotoCarousel = ({ photos }: { photos: PhotoItem[] }) => (
  <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
    <div className="flex gap-3 px-6 md:px-20 pb-2" style={{ width: "max-content" }}>
      {photos.map((p, i) => (
        <div
          key={i}
          style={{
            width: 220,
            height: 220,
            background: p.color,
            backgroundImage: p.src ? `url(${p.src})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: BORDER_FAINT,
          }}
          aria-label={p.alt || `foto ${i + 1}`}
        />
      ))}
    </div>
  </div>
);

const Collage = ({ items }: { items: CollageItem[] }) => {
  const brown = items.find((i) => i.size === "lg") || items[0];
  const green = items.find((i) => i.size === "sm") || items[1];
  return (
    <div className="flex flex-col gap-4 w-full">
      {brown && (
        <div>
          <div
            style={{
              width: "100%",
              aspectRatio: "5 / 4",
              background: brown.color,
              backgroundImage: brown.src ? `url(${brown.src})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: BORDER_FAINT,
            }}
          />
          {brown.caption && (
            <p className="font-caveat mt-2" style={{ color: "#C4622D", fontSize: 18 }}>
              {brown.caption}
            </p>
          )}
        </div>
      )}
      {green && (
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            background: green.color,
            backgroundImage: green.src ? `url(${green.src})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: BORDER_FAINT,
          }}
        />
      )}
    </div>
  );
};

const NoteCard = ({ n }: { n: NoteEntry }) => (
  <article className="flex flex-col" style={{ border: BORDER_FAINT, background: "#FAFAF8" }}>
    {n.imageColor && (
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 2",
          background: n.imageColor,
          backgroundImage: n.imageSrc ? `url(${n.imageSrc})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    )}
    <div className="p-5 flex flex-col gap-2">
      <p className="font-caveat" style={{ color: "#C4622D", fontSize: 18 }}>
        {n.maturity === "semilla" ? "🌱 semilla" : n.maturity === "brote" ? "🌿 brote" : "🍎 fruto"}
      </p>
      <h3 style={{ fontWeight: 600, fontSize: 17, color: "#1C1A17" }}>{n.title}</h3>
      <p style={{ color: "#1C1A17", opacity: 0.7, fontSize: 14, lineHeight: 1.5 }}>{n.excerpt}</p>
      <p className="font-caveat mt-2" style={{ color: "#C4622D", fontSize: 16 }}>{n.date}</p>
    </div>
  </article>
);

const RecCard = ({ r }: { r: RecEntry }) => (
  <article className="flex" style={{ border: BORDER_FAINT, background: "#FAFAF8" }}>
    <div
      style={{
        width: 110,
        minWidth: 110,
        background: r.imageColor || "#D4B896",
        backgroundImage: r.imageSrc ? `url(${r.imageSrc})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
    <div className="p-4 flex flex-col gap-2">
      <p className="font-caveat" style={{ color: "#C4622D", fontSize: 16 }}>{r.type}</p>
      <h3 style={{ fontWeight: 600, fontSize: 16, color: "#1C1A17", lineHeight: 1.3 }}>
        {r.title}
        {r.author && <span style={{ fontWeight: 400, opacity: 0.7 }}> — {r.author}</span>}
      </h3>
      <p style={{ color: "#1C1A17", opacity: 0.7, fontSize: 13, lineHeight: 1.5 }}>{r.review}</p>
      <p style={{ color: "#C4622D", fontSize: 13, letterSpacing: "0.1em" }}>{r.rating}</p>
    </div>
  </article>
);

const LogCard = ({ l }: { l: LogEntry }) => (
  <article className="p-5 flex flex-col gap-3" style={{ border: BORDER_FAINT, background: "#FAFAF8" }}>
    <p className="font-caveat" style={{ color: "#C4622D", fontSize: 26, lineHeight: 1.1 }}>{l.date}</p>
    <p style={{ color: "#1C1A17", fontSize: 15, lineHeight: 1.55 }}>{l.text}</p>
    <span
      className="self-start px-2 py-1 font-caveat"
      style={{ color: "#C4622D", border: "0.5px solid #C4622D", fontSize: 14 }}
    >
      {l.mood}
    </span>
  </article>
);

const LadoB = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { posts, loading } = useGardenPosts();
  const { tipo, setTipo, mat, setMat, tema, setTema, temas, filtered } = useGardenFilters(posts);
  const visible = filtered.slice(0, 6);

  return (
    <div className="lado-b font-quicksand min-h-screen" style={{ background: "#FAFAF8", color: "#1C1A17" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40" style={{ background: "#FAFAF8", borderBottom: BORDER_FAINT }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium" style={{ color: "#1C1A17" }}>Karien.xyz</Link>
          <div className="hidden md:flex gap-8 text-sm" style={{ color: "#1C1A17", opacity: 0.7 }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:opacity-100 transition-opacity">
                {l.label}
              </a>
            ))}
          </div>
          <Link to="/lado-a" className="hidden md:inline text-sm transition-opacity hover:opacity-70" style={{ color: "#C4622D" }}>
            Lado A →
          </Link>
          <button className="md:hidden text-xl" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">···</button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 py-4 flex flex-col gap-3" style={{ borderTop: BORDER_FAINT }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: "#1C1A17" }}>{l.label}</a>
            ))}
            <Link to="/lado-a" style={{ color: "#C4622D" }}>Lado A →</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-6 md:px-20">
          <p className="font-caveat mb-4" style={{ color: "#C4622D", fontSize: 22 }}>Lado B</p>
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: "clamp(40px, 6vw, 68px)",
              lineHeight: 1.1,
              maxWidth: 760,
              color: "#1C1A17",
              marginBottom: 24,
            }}
          >
            Una casita digital para mi curiosidad.
          </h1>
          <p style={{ maxWidth: 560, fontSize: 17, lineHeight: 1.6, color: "#1C1A17", opacity: 0.75 }}>
            Cuaderno de apuntes, notas en proceso, reseñas y pensamientos que preferiría no olvidar.
          </p>
        </div>

        <div className="mt-12">
          <PhotoCarousel photos={HERO_PHOTOS} />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="px-6 md:px-20 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <p className="font-caveat mb-4" style={{ color: "#C4622D", fontSize: 22 }}>en qué ando</p>
            <div className="flex flex-col gap-5" style={{ fontSize: 17, lineHeight: 1.7, color: "#1C1A17" }}>
              <p>
                Estoy en medio de una maestría, un podcast, una agencia y varios proyectos paralelos.
              </p>
              <p>
                Este es el lado B: el espacio donde proceso, archivo y curioseo sin necesidad de que todo esté terminado.
              </p>
              <p style={{ opacity: 0.8 }}>
                Lo que aquí ves es un cuaderno de campo. A veces son ideas, a veces son cosas que me gustaron, a veces solo es lo que pasó hoy.
              </p>
            </div>

            <div className="mt-10">
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>qué encontrarás aquí:</p>
              <ul className="flex flex-col gap-2" style={{ fontSize: 15, color: "#1C1A17", opacity: 0.85 }}>
                {FIND_LIST.map((item, i) => (
                  <li key={i} style={{ borderTop: i === 0 ? BORDER_FAINT : undefined, borderBottom: BORDER_FAINT, padding: "10px 0" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-5">
            <Collage items={COLLAGE} />
          </div>
        </div>
      </section>

      {/* JARDÍN */}
      <section id="jardin" className="px-6 md:px-20 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <p className="font-caveat mb-3" style={{ color: "#C4622D", fontSize: 22 }}>el jardín</p>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 44px)",
              marginBottom: 32,
              color: "#1C1A17",
            }}
          >
            Apuntes, ideas e intereses
          </h2>

          <div className="flex flex-col gap-4 mb-10">
            <FilterRow label="Tipo" options={TIPO_OPTS} active={tipo} onSelect={setTipo} />
            <FilterRow label="Madurez" options={MAT_OPTS} active={mat} onSelect={setMat} />
            <FilterRow label="Temas" options={temas} active={tema} onSelect={setTema} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <GardenSkeleton />
            ) : visible.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center", gridColumn: "1/-1" }}>Nada por aquí todavía</p>
            ) : (
              visible.map((p) => <GardenCard key={p.id} p={p} />)
            )}
          </div>

          {filtered.length > 6 && (
            <div className="flex justify-center mt-10">
              <Link
                to="/jardin"
                className="px-5 py-2.5 text-sm transition-colors"
                style={{ border: "1px solid #C4622D", color: "#C4622D" }}
              >
                Ver más →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-20 py-16" style={{ background: "#1C1A17", color: "#FAFAF8" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p style={{ fontSize: 14, opacity: 0.85 }}>Karien.xyz · Cuaderno de campo.</p>
            <Link to="/lado-a" className="inline-block mt-3" style={{ color: "#C4622D", fontSize: 14, fontWeight: 500 }}>
              ← Ir a Lado A
            </Link>
          </div>
          <p className="font-caveat" style={{ color: "#C4622D", fontSize: 18 }}>
            última actualización: 14 mayo 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LadoB;
