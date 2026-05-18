import type { ProjectDetailProps } from "@/components/ProjectDetail";
import { innovaContent } from "./projects/innova-content";
import { washmaContent } from "./projects/washma-content";
import { commandZContent } from "./projects/commandz-content";

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

export const commandZ: Project = {
  id: "command-z",
  title: "Command Z: del podcast al sistema de aprendizaje",
  description:
    "Cómo construí el archivo digital de Command Z: extracción de datos con Python, categorización temática de +150 episodios y diseño de producto en Base44 para acompañar al oyente con rutas de aprendizaje.",
  client: "Command Z Podcast · Layshi Curbelo",
  year: "2026",
  role: ["Arquitectura de Contenidos", "UX Research"],
  projectType: ["Arquitectura de información", "Investigación aplicada", "Producto digital"],
  tools: ["Python", "Spotify API", "Base44", "Google Colab", "Claude"],
  content: commandZContent,
};

export const projects: Project[] = [innovaPlus, washma, commandZ];
