import type { Env } from './_helpers';
import { json, handleCors } from './_helpers';

export const onRequestOptions: PagesFunction<Env> = async () => handleCors();

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM lenders ORDER BY name'
  ).all();
  // Parse states JSON string to array for frontend
  const parsed = (results ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    states: typeof r.states === 'string' ? JSON.parse(r.states as string) : r.states ?? [],
  }));
  return json(parsed);
};
