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
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  let res;
  try {
    res = await fetch(apiUrl(path), {
      ...options,
      headers,
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

export const postTourEnquiry = (form) =>
  request("/api/tour-enquiries", {
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

export const getTourEnquiries = () => request("/api/admin/tour-enquiries");

export const deleteTourEnquiry = (id) =>
  request("/api/admin/tour-enquiries", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });

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

export const getGallery = () => request("/api/gallery");

export const postGalleryPhoto = (data) => {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return request("/api/admin/gallery", {
      method: "POST",
      body: data,
    });
  }
  return request("/api/admin/gallery", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const convertHeicFile = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return request("/api/admin/convert-heic", {
    method: "POST",
    body: formData,
  });
};

export const deleteGalleryPhoto = (id) =>
  request(`/api/admin/gallery/${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });

export const getOffers = () => request("/api/admin/offers");

export const postSendOffer = (data) =>
  request("/api/admin/offers/send", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteOffer = (id) =>
  request(`/api/admin/offers/${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });

// ---------- Advertisement & Popup APIs ----------
export const getAds = (params = {}) => {
  const q = new URLSearchParams();
  if (params.page) q.set("page", params.page);
  if (params.placement) q.set("placement", params.placement);
  const qs = q.toString();
  return request(`/api/ads${qs ? `?${qs}` : ""}`);
};

export const trackAd = (id, type = "view") =>
  request(`/api/ads/${id}/track`, {
    method: "POST",
    body: JSON.stringify({ type }),
  }).catch(() => {});

export const getAdminAds = () => request("/api/admin/ads");

export const postAdminAd = (data) => {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return request("/api/admin/ads", {
      method: "POST",
      body: data,
    });
  }
  return request("/api/admin/ads", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const putAdminAd = (id, data) => {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return request(`/api/admin/ads/${id}`, {
      method: "PUT",
      body: data,
    });
  }
  return request(`/api/admin/ads/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const toggleAdminAd = (id) =>
  request(`/api/admin/ads/${id}/toggle`, {
    method: "PATCH",
    body: "{}",
  });

export const deleteAdminAd = (id) =>
  request(`/api/admin/ads/${id}`, {
    method: "DELETE",
  });

