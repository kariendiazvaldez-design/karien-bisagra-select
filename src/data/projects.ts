import type { ProjectDetailProps } from "@/components/ProjectDetail";
import { innovaContent } from "./projects/innova-content";
import { washmaContent } from "./projects/washma-content";

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

export const washma: Project = {
  id: "washma",
  title: "WASHMA / Mujeres Kañaris tejiendo identidad",
  description:
    "Tres proyectos, cinco años, una sola pregunta: ¿cómo acompañar desde el respeto y para el crecimiento colectivo? Service design en territorio con mujeres artesanas quechuahablantes de la sierra de Lambayeque.",
  client: "Asociación Warmikuna Awakun Shumaqta · Kañaris",
  year: "2023",
  role: ["Project Manager", "Comunicadora", "Service Design"],
  projectType: ["Desarrollo territorial", "Gestión cultural", "Investigación aplicada"],
  tools: [
    "Business Model Canvas",
    "Diseño territorial",
    "Facilitación presencial",
    "Gestión de alianzas",
    "Narrativa curatorial",
    "Proposition Value",
  ],
  content: washmaContent,
};

export const projects: Project[] = [innovaPlus, washma];
