/**
 * Case-insensitive string comparison
 */
export default function isEqual(a: string, b: string) {
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
  }

  return false;
}
