import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "n8so89qf",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: import.meta.env.VITE_SANITY_TOKEN || undefined,
});

const builder = imageUrlBuilder(sanityClient);

type ImageSource = Parameters<typeof builder.image>[0];

export const urlFor = (source: ImageSource) => builder.image(source);
