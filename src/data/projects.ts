import type { ProjectDetailProps } from "@/components/ProjectDetail";

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
  content: `
## Contexto

INNOVA+ es un programa ejecutivo de ocho semanas para fortalecer la gestión de I+D+i en empresas peruanas. La primera edición (2024) fue un piloto exitoso — 4,6/5 de satisfacción, 15 empresas, financiamiento íntegro del BID.

[IMAGE: Foto sesión inaugural o clausura Lima — composición horizontal]

En 2024 coordiné la ejecución del piloto: logística, seguimiento a empresas, medición de experiencia y evaluación final. En 2025 asumí el diseño completo: metodología, rebranding, convocatoria, coordinación de mentores, facilitación de eventos presenciales y documentación para la edición siguiente.

## Lo que reveló la primera edición

Al cerrar 2024, sistematicé lo observado durante el ciclo. Tres patrones concentraban la mayor parte del ruido:

[IMAGE: Captura Miro — síntesis de los 3 patrones identificados]

**Heterogeneidad de madurez no gestionada.** Empresas con equipos de I+D formados convivían con empresas que recién nombraban un responsable. El mismo contenido y ritmo para todos generaba frustración en ambos extremos.

**Mentorías desconectadas del programa.** Las empresas hacían los módulos y luego tenían las mentorías, como pistas paralelas que nunca se cruzaban.

**Comunidad que se disolvía al terminar.** Los vínculos entre empresas eran el activo más valorado y nadie los había diseñado para sobrevivir al cierre del programa.

## Las tres decisiones de rediseño

[GIF: Diapositivas de contenido del programa — síntesis visual en tres capas]

**Decisión 1 · Convertir el diagnóstico de entrada en el primer insumo de diseño**

En 2024 el diagnóstico era un trámite administrativo. En 2025 lo rediseñé como herramienta de segmentación: informó el match empresa-mentor y la ruta asignada entre tres opciones.

**Decisión 2 · Redistribuir las mentorías a lo largo del ciclo formativo**

Redistribuí las cuatro sesiones de mentoría: la primera anclada al diagnóstico de entrada, dos intermedias acompañando los módulos, y la cuarta orientada al cierre. Fue el cambio que más impactó en la experiencia percibida: 4,56/5 de valoración.

[GIF: Captura o gif de Padlet de seguimiento]

**Decisión 3 · Rediseñar el cierre como apertura de red**

En 2024 la clausura cerraba vínculos que nadie había diseñado para sobrevivir. En 2025 la rediseñé como primer paso hacia una Red Nacional I+D+i. El 97% de los asistentes manifestó interés en participar.

## Blueprint y arquetipos

Al cerrar el ciclo, produje documentación completa para que la siguiente iteración no empiece desde cero.

[IMAGE: Preview del service blueprint INNOVA+ 2025]

[IMAGE: Preview de los 4 arquetipos de empresa]

## Resultados

| 84% | Asistencia sostenida |
| 4,2/5 | Satisfacción general |
| 4,56/5 | Valoración de mentorías |
| 20/22 | Hojas de ruta entregadas |
| 93% | Evaluación de salida ≥ 18/20 |
| 97% | Interés en Red Nacional I+D+i |

[IMAGE: Fotos grupales de participantes — clausura 2025]

## Lo que aprendí

1. Operar desde adentro reduce el margen para observar, pero aumenta la calidad de lo que observas. Compensé eso documentando en tiempo real.
2. Tener las dos ediciones fue la ventaja real. No porque la segunda fuera mejor, sino porque pude ver exactamente por qué era mejor y documentarlo con evidencia propia.
3. Un programa bien diseñado produce sus propios insumos para la siguiente iteración. El blueprint y los arquetipos son el punto de partida del siguiente.
  `,
};
