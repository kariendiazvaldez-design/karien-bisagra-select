export const CASE_STUDIES_QUERY = `*[_type == "caseStudy"] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  tag,
  category,
  excerpt,
  description,
  mainImage
}`;

export const CASE_STUDY_BY_SLUG_QUERY = `*[_type == "caseStudy" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  tag,
  category,
  excerpt,
  description,
  body,
  mainImage,
  publishedAt
}`;

export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  publishedAt,
  mainImage
}`;

export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body,
  mainImage,
  publishedAt
}`;

export const GARDEN_NOTES_QUERY = `*[_type == "gardenNote"] | order(_updatedAt desc) {
  _id,
  title,
  "slug": slug.current,
  state,
  format,
  topics,
  date,
  published
}`;

export const GARDEN_NOTE_BY_SLUG_QUERY = `*[_type == "gardenNote" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  state,
  format,
  topics,
  date,
  body,
  published,
  _updatedAt
}`;

export const INTERESTS_QUERY = `*[_type == "interest"] | order(_updatedAt desc) {
  _id,
  name,
  why,
  status,
  since
}`;

export const RECOMMENDATIONS_QUERY = `*[_type == "recommendation"] | order(_createdAt desc) {
  _id,
  title,
  category,
  author,
  description,
  url,
  date
}`;
