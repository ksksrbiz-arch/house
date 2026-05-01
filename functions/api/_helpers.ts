/**
 * D1 helper types for Cloudflare Pages Functions.
 * All API routes receive `env.DB` (a D1Database binding).
 */

export interface Env {
  DB: D1Database;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  ZILLOW_API_KEY?: string;
  ENVIRONMENT?: string;
}

/** Standard JSON response helper */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/** CORS preflight handler */
export function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
