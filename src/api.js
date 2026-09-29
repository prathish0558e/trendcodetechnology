async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
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
