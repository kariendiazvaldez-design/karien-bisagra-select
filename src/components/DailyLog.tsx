type LogEntry = {
  date: string;
  text: string;
  mood: string;
};

const DEFAULT_ENTRIES: LogEntry[] = [
  {
    date: "12 de mayo de 2025",
    text: "Día de mapear flujos. A veces el mejor avance es tachar tres pasos del proceso.",
    mood: "concentrada",
  },
  {
    date: "8 de mayo de 2025",
    text: "Empecé a leer sobre arquitectura de información en museos. Demasiadas pestañas abiertas, demasiadas preguntas nuevas.",
    mood: "curiosa",
  },
  {
    date: "3 de mayo de 2025",
    text: "Semana larga. Hoy solo riego el jardín y dejo notas a medias para la próxima.",
    mood: "cansada",
  },
];

interface DailyLogProps {
  entries?: LogEntry[];
}

const DailyLog = ({ entries = DEFAULT_ENTRIES }: DailyLogProps) => {
  const sorted = [...entries].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return db - da;
  });

  return (
    <section id="log-cotidiano" className="px-6 md:px-20 py-24 md:py-32">
      <div className="max-w-3xl mx-auto">
        <p className="font-caveat mb-3" style={{ color: "#C4622D", fontSize: 20 }}>
          el día a día
        </p>
        <h2 className="mb-10" style={{ fontWeight: 600, fontSize: 36 }}>
          Log cotidiano
        </h2>

        <ul className="flex flex-col">
          {sorted.map((entry, i) => (
            <li
              key={`${entry.date}-${i}`}
              className="py-6"
              style={{
                borderTop: i === 0 ? "0.5px solid #D4CFC5" : undefined,
                borderBottom: "0.5px solid #D4CFC5",
              }}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <p
                  style={{
                    color: "#D4916A",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  {entry.date}
                </p>
                <span
                  className="inline-block px-2.5 py-1"
                  style={{
                    border: "0.5px solid #D4916A",
                    color: "#C4622D",
                    fontSize: 11,
                    textTransform: "lowercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {entry.mood}
                </span>
              </div>
              <p style={{ color: "#1C1A17", fontSize: 15, lineHeight: 1.6 }}>{entry.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DailyLog;
