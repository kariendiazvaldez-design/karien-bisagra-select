import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

type NotionProject = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  tipo: string[];
  cliente: string[];
  rol: string[];
  destacado: boolean;
  fecha: string | null;
  cover: string | null;
};

// Fallback images for legacy known slugs (Notion cover is used when available).
const FALLBACK_IMAGES: Record<string, string> = {
  "innova-plus": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1779256438/Innova_Inauguraci%C3%B3n_k9a91c.gif",
  "command-z": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1781047547/Captura_de_pantalla_2026-06-09_182538_zfa578.png",
  "la-huaca": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1779304772/LHI_2_bqmzvf.gif",
  "washma": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1781047625/471373683_616174887418431_7143005213072550297_n_rlqked.jpg",
  "patria-c": "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1781048292/Dise%C3%B1o_sin_t%C3%ADtulo_x9gcjd.png",
};

const badge = (text: string) => (
  <span className="ds-pill" style={{ background: "#F4D8D0", color: "#6A1A08", alignSelf: "flex-start" }}>
    {text}
  </span>
);

export default function Proyectos() {
  const [projects, setProjects] = useState<NotionProject[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke("get-portfolio-projects", { method: "GET" })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("get-portfolio-projects error", error);
          setProjects([]);
        } else {
          setProjects(Array.isArray(data?.projects) ? data.projects : []);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const list = (projects ?? []).filter((p) => p.slug);

  return (
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      <Seo
        title="Proyectos — Portafolio de Karien Díaz Valdez"
        description="Portafolio completo de proyectos de diseño de servicios, transformación digital y aprendizaje de Karien Díaz Valdez."
        path="/proyectos"
      />

      <nav className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]" style={{ borderBottomWidth: "0.5px" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/lado-a" className="font-medium">← Karien.xyz</Link>
          <Link to="/lado-b" className="text-sm text-a-accent-soft hover:text-a-accent">Lado B →</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-24">
        <h1 className="ds-section-title mb-10">Portafolio:</h1>

        {projects === null ? (
          <p style={{ color: "#888" }}>Cargando proyectos…</p>
        ) : list.length === 0 ? (
          <p style={{ color: "#888" }}>Aún no hay proyectos publicados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((p) => {
              const image = p.cover || FALLBACK_IMAGES[p.slug as string];
              const category = p.tipo.slice(0, 3).join(" · ");
              const scale = p.cliente.join(" · ");
              return (
                <Link
                  key={p.id}
                  to={`/proyectos/${p.slug}`}
                  className="ds-card group flex flex-col"
                >
                  <div style={{ width: "100%", height: 180, background: "#EDF4E2", overflow: "hidden" }}>
                    {image && (
                      <img src={image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {category && (
                      <p className="uppercase" style={{ fontSize: 10, color: "#C94A20", letterSpacing: "0.12em", fontWeight: 500 }}>
                        {category}
                      </p>
                    )}
                    <h2 style={{ fontSize: 17, fontWeight: 500, color: "#1A1F0A", lineHeight: 1.3 }}>
                      {p.title}
                    </h2>
                    {scale && badge(scale)}
                    {p.description && (
                      <p style={{ fontSize: 13, color: "#5A5A4A", fontWeight: 300, lineHeight: 1.6 }}>
                        {p.description}
                      </p>
                    )}
                    <span style={{ fontSize: 12, color: "#3D6B1F", fontWeight: 500, marginTop: "auto" }}>
                      Ver caso →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
