export function generateFauxEmail(username) {
  return username
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "") + "@classeapp.com";
}