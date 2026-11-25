/* The contract's rules for an email and a password ("Email and password").
 * The forms check them first, so people get a message in their language; the
 * API checks them again.
 */

export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** `name@domain` with a dot in the domain, as the API checks it. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The email as the backend keeps it: trimmed and lowercased. */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmail(email: string) {
  const normalized = normalizeEmail(email);
  return normalized.length <= EMAIL_MAX && EMAIL.test(normalized);
}

/** Characters as the API counts them: code points, so an emoji is one. */
function length(text: string) {
  return [...text].length;
}

export type PasswordProblem = "short" | "long";

/**
 * What's wrong with a new password, if anything. Logging in only checks the
 * longest, so a password made under older rules still works.
 */
export function passwordProblem(
  password: string,
  { forLogIn = false } = {},
): PasswordProblem | undefined {
  const size = length(password);
  if (size > PASSWORD_MAX) return "long";
  if (forLogIn ? size === 0 : size < PASSWORD_MIN) return "short";
  return undefined;
}

/**
 * Where to go after logging in: `next` when it's a path on this site, and
 * not a log-in page again; otherwise `fallback`. `next` comes from the URL,
 * so anything else, such as `//evil.example` or `javascript:`, is refused.
 */
export function safeNext(next: string | null | undefined, fallback: string) {
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  const base = "http://legoin.invalid";
  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return fallback;
  }
  if (
    url.origin !== base ||
    /^\/[^/]+\/(login|register)\/?$/.test(url.pathname)
  ) {
    return fallback;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
