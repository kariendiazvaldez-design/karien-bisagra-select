import { Link } from "react-router-dom";

const LadoB = () => {
  return (
    <main className="min-h-screen bg-background text-foreground font-quicksand px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-b-accent text-sm hover:underline">
          ← karien.xyz
        </Link>
        <h1 className="mt-12 text-4xl font-medium">Lado B</h1>
        <p className="mt-4 text-muted-foreground">Próximamente.</p>
      </div>
    </main>
  );
};

export default LadoB;
