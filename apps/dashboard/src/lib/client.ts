/**
 * API base URL — in production, the Pages Functions are served from the same origin.
 * In development, you can override this via VITE_API_URL.
 */
const API_BASE = (import.meta.env.VITE_API_URL as string) ?? '';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`API error ${resp.status}: ${body}`);
  }
  return resp.json() as Promise<T>;
}

export { API_BASE, apiFetch };
