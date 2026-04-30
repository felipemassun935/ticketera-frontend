const BASE = import.meta.env.VITE_API_URL || '/api';

function token() {
  try { return JSON.parse(sessionStorage.getItem('ticketera_session'))?.token ?? null; }
  catch { return null; }
}

export async function apiFetch(method, path, body) {
  const tk = token();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(tk && { Authorization: `Bearer ${tk}` }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export const api = {
  get:   (path)         => apiFetch('GET',    path),
  post:  (path, body)   => apiFetch('POST',   path, body),
  patch: (path, body)   => apiFetch('PATCH',  path, body),
  del:   (path)         => apiFetch('DELETE', path),
};
