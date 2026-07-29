import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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

const typeBadge = (tipo: string) => {
  const t = tipo.toUpperCase();
  const isB2B = t === "B2B";
  const isB2C = t === "B2C";
  const bg = isB2B ? "#E3ECD1" : isB2C ? "#F4D8D0" : "#EDE7D3";
  const color = isB2B ? "#3D6B1F" : isB2C ? "#6A1A08" : "#5A5A2A";
  return (
    <span
      key={tipo}
      className="ds-pill"
      style={{ background: bg, color, fontWeight: 600, letterSpacing: "0.04em" }}

    >
      {tipo}
    </span>
  );
};


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

      <nav
        className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/lado-a" className="font-medium">Karien.xyz</Link>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/lado-a" className="text-a-accent-soft hover:text-a-accent">Lado A</Link>
            <Link to="/blog" className="text-a-accent-soft hover:text-a-accent">blog</Link>
          </div>
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
              const cliente = p.cliente.join(" · ");
              const year = p.fecha ? p.fecha.slice(0, 4) : "";
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {year && (
                        <span style={{ fontSize: 11, color: "#7A8060", fontWeight: 600, letterSpacing: "0.08em" }}>
                          {year}
                        </span>
                      )}
                      {p.tipo.map((t) => typeBadge(t))}
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 500, color: "#1A1F0A", lineHeight: 1.3 }}>
                      {p.title}
                    </h2>
                    {p.rol.length > 0 && (
                      <p style={{ fontSize: 12, color: "#C94A20", fontWeight: 500, letterSpacing: "0.02em" }}>
                        {p.rol.join(" · ")}
                      </p>
                    )}

                    {cliente && (
                      <p style={{ fontSize: 11, color: "#8A8A6A", fontWeight: 400 }}>
                        {cliente}
                      </p>
                    )}
                    {p.description && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#5A5A4A",
                          fontWeight: 300,
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
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

      {/* Footer con identidad */}
      <footer
        className="blog-identity-footer"
        style={{
          borderTop: "1px solid #E8E8E8",
          background: "#FAFAF7",
          padding: "48px 24px",
        }}
      >
        <div
          className="blog-identity-inner mx-auto"
          style={{ maxWidth: 1100, display: "flex", alignItems: "center", gap: 32 }}
        >
          <img
            className="blog-identity-photo"
            src="https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1777913217/1_kmkeqj.png"
            alt="Karien Díaz"
            style={{ width: 64, height: 64, borderRadius: 8, flexShrink: 0, objectFit: "cover" }}
          />
          <div className="blog-identity-text" style={{ flex: 1 }}>
            <p style={{ fontFamily: "Lexend, sans-serif", fontWeight: 700, fontSize: 15, color: "#1A1A1A", marginBottom: 6 }}>
              Karien Díaz
            </p>
            <p style={{ fontFamily: "Lexend, sans-serif", fontSize: 13, color: "#666", lineHeight: 1.7, maxWidth: 400 }}>
              Diseñadora de servicios y comunicadora. Trabajo en la intersección entre personas, procesos y tecnología, con organizaciones que quieren que las cosas funcionen mejor para quienes las usan.
            </p>
          </div>
          <div
            className="blog-identity-ctas"
            style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}
          >
            <Link
              to="/lado-a#proyectos"
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 6,
                background: "#6B7A3E",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              Ver portafolio →
            </Link>
            <a
              href={"https://wa.me/51927822614?text=" + encodeURIComponent("Hola, vengo de tu web!")}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 6,
                border: "1px solid #6B7A3E",
                color: "#6B7A3E",
                textAlign: "center",
              }}
            >
              ¿Trabajamos juntxs? →
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        .blog-mini-footer-inner { gap: 12px; flex-direction: row; }
        @media (max-width: 639px) {
          .blog-mini-footer-inner { flex-direction: column; gap: 12px; }
          .blog-mini-footer-sep { display: none; }
          .blog-identity-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
          .blog-identity-ctas { width: 100%; }
        }
      `}</style>
    </div>
  );
}
