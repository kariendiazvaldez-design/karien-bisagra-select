import { Link } from "react-router-dom";

const LadoA = () => {
  return (
    <main className="min-h-screen bg-a-bg text-background font-lexend px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-a-accent-soft text-sm hover:underline">
          ← karien.xyz
        </Link>
        <h1 className="mt-12 text-4xl font-medium">Lado A</h1>
        <p className="mt-4 text-muted-foreground">Próximamente.</p>
      </div>
    </main>
  );
};

export default LadoA;
