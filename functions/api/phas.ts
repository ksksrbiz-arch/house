import type { Env } from './_helpers';
import { json, handleCors } from './_helpers';

export const onRequestOptions: PagesFunction<Env> = async () => handleCors();

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM phas ORDER BY name'
  ).all();
  return json(results);
};
