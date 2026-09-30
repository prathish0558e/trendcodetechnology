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

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
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
    throw new Error((body && body.error) || `Request failed (${res.status})`);
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

export const postLogout = () =>
  request("/api/logout", { method: "POST", body: "{}" });
