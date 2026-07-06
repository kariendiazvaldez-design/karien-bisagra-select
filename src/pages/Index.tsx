import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Seo from "@/components/Seo";

const Index = () => {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  const handleNavigate = (path: string) => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => navigate(path), 350);
  };

  return (
    <main
      className={`h-screen w-screen overflow-hidden flex flex-col relative transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Lado A — superior (oscuro) */}
      <button
        onClick={() => handleNavigate("/lado-a")}
        className="group relative flex-1 bg-a-bg text-left px-6 sm:px-12 md:px-20 flex flex-col justify-center transition-all duration-300 hover:brightness-110 focus:outline-none rounded-none"
        aria-label="Ir a Lado A — Blog y portafolio"
      >
        <div className="max-w-xl mx-auto w-full">
          <p className="font-lexend text-xs tracking-[0.25em] uppercase text-a-accent-soft mb-4">
            Lado A
          </p>
          <h1 className="font-lexend font-medium text-4xl sm:text-5xl md:text-6xl text-background mb-4">
            Blog &amp; portafolio
          </h1>
          <p className="font-lexend text-base sm:text-lg text-muted-foreground mb-8 max-w-md">
            Documentación sobre diseño de servicios, transformación digital e impacto social.
          </p>
          <span className="font-lexend text-a-accent-soft text-base sm:text-lg inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
            Explorar →
          </span>
        </div>
      </button>

      {/* Lado B — inferior (crema) */}
      <button
        onClick={() => handleNavigate("/lado-b")}
        className="group relative flex-1 bg-background text-left px-6 sm:px-12 md:px-20 flex flex-col justify-center transition-all duration-300 hover:brightness-105 focus:outline-none rounded-none"
        aria-label="Ir a Lado B — Jardín digital"
      >
        <div className="max-w-xl mx-auto w-full">
          <p className="font-caveat text-2xl tracking-wide text-b-accent-deep mb-2">
            Lado B
          </p>
          <h2 className="font-quicksand font-medium text-4xl sm:text-5xl md:text-6xl text-foreground mb-4">
            Jardín digital
          </h2>
          <p className="font-quicksand text-base sm:text-lg text-muted-foreground mb-8 max-w-md">
            Un país de curiosidades y archivo de intereses.
          </p>
          <span className="font-quicksand text-b-accent text-base sm:text-lg inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
            Curiosear →
          </span>
        </div>
      </button>

      {/* Bisagra ámbar — perfectamente centrada en el corte */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="h-[2px] w-full bg-hinge" />
        <div className="absolute left-1/2 -translate-x-1/2 bg-hinge px-4 py-1 animate-hinge-pulse rounded-none">
          <span
            className="font-lexend text-xs sm:text-sm tracking-wide"
            style={{ color: "#1C1A17" }}
          >
            karien.xyz
          </span>
        </div>
      </div>
    </main>
  );
};

export default Index;
