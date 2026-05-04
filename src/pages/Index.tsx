import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Lado B — superior */}
      <button
        onClick={() => navigate("/lado-b")}
        className="group relative flex-1 bg-background text-left px-6 sm:px-12 md:px-20 flex flex-col justify-center transition-opacity duration-500 hover:opacity-95 focus:outline-none"
        aria-label="Ir a Lado B — Jardín digital"
      >
        <div className="max-w-xl mx-auto w-full">
          <p className="font-caveat text-base tracking-[0.25em] uppercase text-b-accent-soft mb-4">
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

      {/* Bisagra ámbar */}
      <div className="relative h-[2px] bg-hinge w-full">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-hinge px-4 py-1">
          <span className="font-lexend text-xs sm:text-sm text-foreground tracking-wide">
            karien.xyz
          </span>
        </div>
      </div>

      {/* Lado A — inferior */}
      <button
        onClick={() => navigate("/lado-a")}
        className="group relative flex-1 bg-a-bg text-left px-6 sm:px-12 md:px-20 flex flex-col justify-center transition-opacity duration-500 hover:opacity-95 focus:outline-none"
        aria-label="Ir a Lado A — Blog y portafolio"
      >
        <div className="max-w-xl mx-auto w-full">
          <p className="font-lexend text-xs tracking-[0.25em] uppercase text-a-accent-soft mb-4">
            Lado A
          </p>
          <h1 className="font-lexend font-medium text-4xl sm:text-5xl md:text-6xl text-background mb-4">
            Blog & portafolio
          </h1>
          <p className="font-lexend text-base sm:text-lg text-muted-foreground mb-8 max-w-md">
            Documentación sobre diseño de servicios, transformación digital e impacto social.
          </p>
          <span className="font-lexend text-a-accent-soft text-base sm:text-lg inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
            Ver trabajo →
          </span>
        </div>
      </button>
    </main>
  );
};

export default Index;
