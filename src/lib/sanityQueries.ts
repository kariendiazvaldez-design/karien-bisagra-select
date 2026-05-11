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
  maturity,
  format,
  topic,
  excerpt,
  description
}`;

export const GARDEN_NOTE_BY_SLUG_QUERY = `*[_type == "gardenNote" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  maturity,
  format,
  topic,
  excerpt,
  body,
  publishedAt,
  _updatedAt
}`;
