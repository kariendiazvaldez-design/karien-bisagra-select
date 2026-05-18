export const commandZContent = `
> ¿Cómo conviertes 150 episodios de conocimiento disperso en algo que un diseñador latinoamericano pueda usar para crecer?

Command Z es el podcast de Layshi Curbelo: más de 150 episodios sobre diseño, tecnología y cultura creativa, en español e inglés, con una comunidad activa en Latinoamérica. Un proyecto con trayectoria destacada y de varios años, que aún no tenía archivo. Como suele pasar con los podcasts que crecen orgánicamente, el conocimiento vivía disperso: en Spotify, en un Excel parcial, en la memoria de la creadora.

Layshi, muy generosamente, abrió las puertas del podcast para una pasantía. Mi misión era específica: tomar lo que ya existía y convertirlo en algo navegable y útil. Esto evolucionó a la creación de un nuevo producto, que conecte con los oyentes y explore cómo aportarles valor.

[IMAGE: Interfaz principal del producto en Base44]

## El usuario

En conversaciones con Layshi sobre su audiencia, emergió un perfil claro: diseñadores latinoamericanos en proceso de crecimiento profesional, que escuchan el podcast de forma no lineal: por episodio suelto, por recomendación, por búsqueda puntual. No tenían forma de saber qué escuchar según dónde estaban en su carrera, ni de encontrar episodios sobre un tema específico sin recordar el título exacto.

## El reto

> ¿Cómo se categoriza el conocimiento sobre diseño para que sea realmente accesible? ¿Qué arquitectura hace que una biblioteca de podcast funcione y no sea solo una lista con otro formato?

El encargo original era más acotado: ordenar lo que existía. Pero el problema de diseño real era otro: el valor estaba en el conocimiento acumulado, y ese valor era casi inaccesible para quien llegaba nuevo. Eso, con el empuje de Layshi y herramientas IA como Base44, reencuadró el proyecto hacia la creación de un producto.

## ¿Cómo lo afronté?

### 1. Extracción de datos

Conecté la API pública de Spotify for Developers con un script en Python (Google Colab) para extraer metadatos de cada episodio: título, fecha, duración, idioma, enlace. No soy programadora, pero sabía qué información necesitaba y cómo conseguirla.

[GIF: Script corriendo en Google Colab — extracción via Spotify API]

### 2. Cruce e investigación manual

La base de Spotify cubrió el 60% de los invitados. El restante requirió investigación episodio por episodio: bios, redes, perfiles. Este paso reveló algo importante: la calidad del archivo dependía de la calidad del criterio editorial, no solo de los datos disponibles.

[IMAGE: Fotos de entrevistados — galería]

### 3. Categorización temática: el trabajo más interpretativo

Con el corpus completo, la pregunta era: ¿cómo agrupa un diseñador latinoamericano el conocimiento sobre diseño? No desde la lógica del productor, sino desde la lógica de quien busca. Leí las descripciones de cada episodio e identifiqué al menos tres subtemas por capítulo.

> Las rutas de aprendizaje no son listas de reproducción. Son caminos con intención: Fundamentos → Proceso y Aplicación → Estrategia y Liderazgo. La diferencia entre una playlist y una ruta es que la ruta tiene una hipótesis sobre quién eres y a dónde quieres llegar.

[GIF: Sistema de categorías navegándose]

### 4. Construcción del producto en Base44

Una biblioteca navegable con filtros por categoría, idioma y buscador. Cada episodio tiene ficha propia con resumen, bio del invitado, player de Spotify embebido, aprendizajes clave, reto de aplicación y comentarios.

[GIF: App Base44 con filtros y biblioteca navegable]

### 5. Estrategia de validación

La primera versión es de acceso gratuito con login. La fricción mínima del registro es suficiente para medir demanda real antes de monetizar. Es una decisión de producto, no de UX: el objetivo es datos.

La arquitectura temática refleja cómo interpreté el conocimiento del podcast, no cómo lo busca realmente el usuario. El siguiente paso necesario es testear las categorías con oyentes reales. Eso está pendiente y es lo que determinará si el sistema funciona o hay que rediseñarlo.

## Resultados

| 150+ | Episodios catalogados con metadatos completos |
| 4 | Rutas de aprendizaje curadas en 3 niveles |
| 3 | Perfiles de usuario con caminos diferenciados |
| 1 | App funcional lista para validación |

[GIF: Pantalla vertical de la app — vista mobile]

## Lo que aprendí

1. Documentar es un acto de diseño. Cada decisión sobre qué guardar, cómo categorizarlo y cómo presentarlo implica criterio, intención y una hipótesis sobre el usuario.

2. La diferencia entre un archivo y un producto es si alguien puede usarlo sin que le expliques cómo. Ese fue el estándar que guió cada decisión de arquitectura.

3. Mi forma de trabajar vive en la intersección entre investigar y construir, como ciclo: investigo para construir mejor, construyo para entender qué investigar.
`;
