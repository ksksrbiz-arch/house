import type { Env } from './_helpers';
import { json, handleCors } from './_helpers';

export const onRequestOptions: PagesFunction<Env> = async () => handleCors();

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const dealId = url.searchParams.get('deal_id');

  let results;
  if (dealId) {
    ({ results } = await env.DB.prepare(
      'SELECT * FROM tenants WHERE deal_id = ? ORDER BY created_at DESC'
    ).bind(dealId).all());
  } else {
    ({ results } = await env.DB.prepare(
      'SELECT * FROM tenants ORDER BY created_at DESC'
    ).all());
  }
  return json(results);
};
