import { customAlphabet } from "nanoid";

const nanoid5 = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);
const nanoidId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 21);

export function generateId() {
  return nanoidId();
}

export function generateProjectSlug(companyName: string): string {
  const base = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return `${base}-${nanoid5()}`;
}
