import type { ProjectDetailProps } from "@/components/ProjectDetail";
import { innovaContent } from "./projects/innova-content";
import { washmaContent } from "./projects/washma-content";
import { commandZContent } from "./projects/commandz-content";
import { patriaCContent } from "./projects/patriac-content";
import { laHuacaContent } from "./projects/lahuaca-content";
import commandZHero from "@/assets/commandz-hero.png";

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
  heroImage: "https://res.cloudinary.com/dyh3wxppm/image/upload/q_auto/f_auto/v1779250719/_DSC1648_fdomqo.jpg",
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
  heroImage: commandZHero,
};

export const patriaC: Project = {
  id: "patria-c",
  title: "Patria C: acompañar a juventudes y liderazgo territorial",
  description:
    "Coordinación integral y diseño de experiencia de academia ciudadana remota para 150 líderes jóvenes de todas las regiones del Perú. Tres módulos formativos, seguimiento personalizado por cohorte y NPS de 91%.",
  client: "Patria C · PeruTeQuiero · Mosaico Lab",
  year: "2023",
  role: ["Project Manager", "Learning Experience"],
  projectType: ["B2C", "Learning Experience Design", "Gestión de programas"],
  tools: ["Miro", "Notion", "Zoom", "Whatsapp Business", "Facilitación virtual"],
  content: patriaCContent,
};

export const laHuaca: Project = {
  id: "la-huaca",
  title: "La Huaca Independiente: diseñé un festival como servicio vigente en 03 ediciones.",
  description:
    "Tres ediciones de un festival cultural en espacios patrimoniales de Lambayeque. Un modelo de activación territorial que combinaba feria de emprendimientos, programación artística y patrimonio como ancla, sin presupuesto propio pero con ecosistema de alianzas como infraestructura.",
  client: "DDC Lambayeque",
  year: "2020",
  role: ["Co-fundadora", "Gestora cultural", "Service Design"],
  projectType: ["Gestión cultural", "Desarrollo territorial", "Investigación aplicada"],
  tools: ["Customer journey", "Ecosystem mapping", "Stakeholder mapping", "Facilitación presencial"],
  content: laHuacaContent,
};

export const projects: Project[] = [innovaPlus, washma, commandZ, patriaC, laHuaca];
