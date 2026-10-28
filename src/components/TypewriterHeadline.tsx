import { useEffect, useState } from "react";
import { Send, Instagram, Linkedin } from "lucide-react";
import karienHero from "@/assets/karien-hero.jpg.asset.json";

const WORDS = ["diseñadora", "project manager", "investigadora"];
const LONGEST = WORDS.reduce((a, b) => (b.length > a.length ? b : a), "");
const TYPE_MS = 80;
const DELETE_MS = 40;
const HOLD_MS = 1500;

const useTypewriter = (words: string[]) => {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const word = words[index];

    if (!deleting) {
      if (length < word.length) {
        const t = window.setTimeout(() => setLength((l) => l + 1), TYPE_MS);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => setDeleting(true), HOLD_MS);
      return () => window.clearTimeout(t);
    }

    if (length > 0) {
      const t = window.setTimeout(() => setLength((l) => l - 1), DELETE_MS);
      return () => window.clearTimeout(t);
    }
    setDeleting(false);
    setIndex((i) => (i + 1) % words.length);
  }, [reduced, deleting, index, length, words]);

  return { text: reduced ? words[0] : words[index].slice(0, length), reduced };
};

const TypewriterHeadline = () => {
  const { text, reduced } = useTypewriter(WORDS);

  return (
    <section className="max-w-6xl w-full mx-auto px-2 text-center">
      <h1 className="ds-tw-title">
        <span className="block">
          Hey, aquí{" "}
          <img
            src={karienHero.url}
            alt="Karien Díaz"
            className="inline-block object-cover rounded-full"
            style={{ width: "0.92em", height: "0.92em", verticalAlign: "-0.1em" }}
          />{" "}
          Karien Díaz
        </span>
        <span className="block" aria-hidden="true">
          una{" "}
          <span className="relative inline-block text-left">
            <span className="invisible whitespace-nowrap">{LONGEST}</span>
            <span className="absolute left-0 top-0 whitespace-nowrap">
              {text}
              {!reduced && <span className="tw-cursor" />}
            </span>
          </span>{" "}
          que ✨
        </span>
        <span className="block">hace funcionar las ideas 🙌</span>
        <span className="sr-only">una diseñadora, project manager e investigadora que hace funcionar las ideas</span>
      </h1>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href="#contacto" className="ds-btn ds-btn-black">
          ¡Hablemos! <Send size={16} />
        </a>
        <a
          href="https://www.instagram.com/karien.xyz/"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="ds-icon-square"
        >
          <Instagram size={20} />
        </a>
        <a
          href="https://www.linkedin.com/in/kariendiaz/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="ds-icon-square"
        >
          <Linkedin size={20} />
        </a>
      </div>
    </section>
  );
};

export default TypewriterHeadline;
