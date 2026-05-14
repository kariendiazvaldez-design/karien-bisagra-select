type LearningEntry = {
  date: string;
  topic: string;
  note: string;
};

const DEFAULT_ENTRIES: LearningEntry[] = [
  {
    date: "Mayo 2025",
    topic: "Diseño de servicios",
    note: "Mapear el viaje del usuario es solo el inicio: lo difícil es alinear a los equipos detrás de cada punto de contacto.",
  },
  {
    date: "Abril 2025",
    topic: "Transformación digital",
    note: "La tecnología no transforma; lo hacen las personas que cambian sus prácticas. La herramienta es solo el pretexto.",
  },
  {
    date: "Marzo 2025",
    topic: "UX Research",
    note: "Las entrevistas semiestructuradas funcionan mejor cuando dejo de buscar respuestas y empiezo a buscar contradicciones.",
  },
];

interface LearningTodayProps {
  entries?: LearningEntry[];
}

const LearningToday = ({ entries = DEFAULT_ENTRIES }: LearningTodayProps) => {
  return (
    <section id="aprendiendo-hoy" className="px-6 md:px-20 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-a-accent-mid mb-3">
          Aprendizajes
        </p>
        <h2 className="font-extralight text-4xl md:text-5xl mb-12">Aprendiendo hoy</h2>

        <ul className="flex flex-col">
          {entries.map((entry, i) => (
            <li
              key={`${entry.date}-${i}`}
              className={`py-6 md:py-8 border-[#D4CFC5] ${
                i < entries.length - 1 ? "border-b" : ""
              }`}
              style={{ borderBottomWidth: i < entries.length - 1 ? "0.5px" : undefined }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                <p className="md:col-span-2 text-xs uppercase tracking-[0.2em] text-a-accent-soft font-medium pt-1">
                  {entry.date}
                </p>
                <div className="md:col-span-2">
                  <span
                    className="inline-block px-3 py-1 text-xs bg-[#EEF0E8] text-a-accent border border-a-accent-soft"
                    style={{ borderWidth: "0.5px" }}
                  >
                    {entry.topic}
                  </span>
                </div>
                <p className="md:col-span-8 text-base text-foreground leading-relaxed">
                  {entry.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LearningToday;
