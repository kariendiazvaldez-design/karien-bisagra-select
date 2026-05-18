import type { ProjectDetailProps } from "@/components/ProjectDetail";
import { innovaContent } from "./projects/innova-content";

export interface Project extends ProjectDetailProps {
  id: string;
}

export const innovaPlus: Project = {
  id: "innova-plus",
  title: "INNOVA+: Dos ediciones de un programa que aprende e itera",
  description:
    "Ejecuté la primera edición. Rediseñé la segunda. Este caso documenta qué cambié en INNOVA+, por qué lo cambié y qué quedó sin resolver. Iteración metodológica de un programa formativo B2B para 22 empresas peruanas.",
  client: "BioActiva · BID · Transforme",
  year: "2025",
  role: ["Service Designer", "Project Manager"],
  projectType: ["B2B", "Learning Experience Design", "Rediseño de servicio"],
  tools: [
    "Service Blueprint",
    "Arquetipos de usuario",
    "Diagnóstico de madurez",
    "Miro",
    "Notion",
    "Zoom",
    "Padlet",
    "Google Suite",
  ],
  content: innovaContent,
};
