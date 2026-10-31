// Helpers for the admin session (token kept in local storage and in a cookie).
// This file only reads the token text and its expiry date. The signature is
// checked by the API, never by the browser or by proxy.ts.

export const TOKEN_KEY = "adminToken";
export const USER_KEY = "adminUser";

// A JWT has three non-empty parts separated by dots.
export function looksLikeJwt(value: string | null | undefined): value is string {
  if (typeof value !== "string") return false;
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

// Returns the "exp" claim (seconds since 1970) or null when it cannot be read.
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1] ?? "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const data = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof data.exp === "number" ? data.exp : null;
  } catch {
    return null;
  }
}

// True when the text looks like a JWT that has not expired yet.
export function isTokenValid(token: string | null | undefined): boolean {
  if (looksLikeJwt(token)) {
    const exp = getTokenExpiry(token);
    if (exp === null) return true;
    return exp * 1000 > Date.now();
  }
  return false;
}

function readCookie(name: string): string | null {
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const part of parts) {
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index) === name) {
      return part.slice(index + 1);
    }
  }
  return null;
}

// The token to send to the API, or null when there is no valid session.
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  let value: string | null = null;
  try {
    value = window.localStorage.getItem(TOKEN_KEY);
  } catch {
    value = null;
  }
  if (isTokenValid(value) === false) {
    value = readCookie(TOKEN_KEY);
  }
  return isTokenValid(value) ? value : null;
}

export function saveSession(token: string, email: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify({ email }));
  } catch {
    // Storage can be blocked (private mode). The cookie below is still written.
  }
  const exp = getTokenExpiry(token);
  const maxAge = exp === null ? 86400 : Math.max(0, exp - Math.floor(Date.now() / 1000));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = TOKEN_KEY + "=" + token + "; path=/; max-age=" + maxAge + "; SameSite=Lax" + secure;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // Storage can be blocked. The cookie is still removed below.
  }
  document.cookie = TOKEN_KEY + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}
