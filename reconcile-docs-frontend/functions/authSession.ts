export const ACCESS_TOKEN_KEY = "reconcile-docs.accessToken";

export interface AuthSessionUser {
  userId: string;
  username: string;
  role: string;
  expiresAtUtc: string | null;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = normalized + (padding === 0 ? "" : "=".repeat(4 - padding));
  return window.atob(padded);
}

function readTokenPayload(token: string) {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(payloadPart)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readStringClaim(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

export function getAccessToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getAuthSessionUser(token = getAccessToken()): AuthSessionUser | null {
  if (!token || !canUseStorage()) {
    return null;
  }

  const payload = readTokenPayload(token);
  if (!payload) {
    return null;
  }

  return {
    userId: readStringClaim(payload, ["sub", "nameid", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]),
    username: readStringClaim(payload, ["unique_name", "name", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]),
    role: readStringClaim(payload, ["role", "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]),
    expiresAtUtc: typeof payload["exp"] === "number" ? new Date(payload["exp"] * 1000).toISOString() : null
  };
}