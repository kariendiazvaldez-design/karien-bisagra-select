type LogEntry = {
  date: string;
  text: string;
  mood: string;
};

const C = {
  bg: "#2C4A52",
  light: "#F5EDD6",
  mustard: "#E8B84B",
  terra: "#D4956A",
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

const lightBorder = "0.5px solid rgba(245, 237, 214, 0.3)";

const DailyLog = ({ entries = DEFAULT_ENTRIES }: DailyLogProps) => {
  const sorted = [...entries].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return db - da;
  });

  return (
    <section
      id="log-cotidiano"
      className="px-6 md:px-20 font-quicksand"
      style={{ background: C.bg, color: C.light, paddingTop: 120, paddingBottom: 140 }}
    >
      <div className="max-w-3xl mx-auto">
        <p className="font-caveat mb-3" style={{ color: C.mustard, fontSize: 22 }}>
          el día a día
        </p>
        <h2
          className="font-caveat mb-12"
          style={{ fontWeight: 400, fontSize: "clamp(40px, 5vw, 56px)", color: C.light, lineHeight: 1.1 }}
        >
          Log cotidiano
        </h2>

        <ul className="flex flex-col">
          {sorted.map((entry, i) => (
            <li
              key={`${entry.date}-${i}`}
              style={{
                padding: "24px 0",
                borderTop: i === 0 ? lightBorder : undefined,
                borderBottom: lightBorder,
              }}
            >
              <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <p
                  className="font-caveat"
                  style={{ color: C.mustard, fontSize: 20 }}
                >
                  {entry.date}
                </p>
                <span
                  className="inline-block px-3 py-1 font-quicksand"
                  style={{
                    border: lightBorder,
                    color: C.terra,
                    fontSize: 11,
                    textTransform: "lowercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {entry.mood}
                </span>
              </div>
              <p style={{ color: C.light, opacity: 0.9, fontSize: 16, lineHeight: 1.6 }}>{entry.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DailyLog;
