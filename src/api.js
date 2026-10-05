import { apiUrl } from "./config/site.js";

const TOKEN_KEY = "tct-admin-token";
const USER_KEY = "tct-admin-user";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function getSavedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Never let a stalled API leave a page spinning forever.
const REQUEST_TIMEOUT_MS = 15000;

async function request(path, options = {}) {
  const token = getToken();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(apiUrl(path), {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
      signal: options.signal || ctrl.signal,
    });
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new Error("The server took too long to respond. Please try again.");
    }
    throw new Error("Could not reach the server. Please check your connection.");
  } finally {
    clearTimeout(timer);
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.status === 401) {
    // stale/expired session — clear it so guards kick in
    clearSession();
  }
  if (!res.ok) {
    const err = new Error((body && body.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const postLead = (form) =>
  request("/api/leads", {
    method: "POST",
    body: JSON.stringify(form),
  });

export const postLogin = (creds) =>
  request("/api/login", {
    method: "POST",
    body: JSON.stringify(creds),
  });

export const getApplications = () => request("/api/admin/applications");

export const getLeads = () => request("/api/admin/leads");

export const getInternships = () => request("/api/admin/internships");

export const getAuthLog = () => request("/api/admin/authlog");

export const getSessions = () => request("/api/admin/sessions");

export const getHealth = () => request("/api/health");

export const postRevokeSession = (tokenPreview) =>
  request("/api/admin/sessions/revoke", {
    method: "POST",
    body: JSON.stringify({ tokenPreview }),
  });

export const postLogout = () =>
  request("/api/logout", { method: "POST", body: "{}" });
