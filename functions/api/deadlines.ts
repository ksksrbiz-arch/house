import type { Env } from './_helpers';
import { json, handleCors } from './_helpers';

export const onRequestOptions: PagesFunction<Env> = async () => handleCors();

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const dealId = url.searchParams.get('deal_id');

  let results;
  if (dealId) {
    ({ results } = await env.DB.prepare(
      'SELECT * FROM compliance_deadlines WHERE deal_id = ? ORDER BY due_date'
    ).bind(dealId).all());
  } else {
    ({ results } = await env.DB.prepare(
      'SELECT * FROM compliance_deadlines ORDER BY due_date'
    ).all());
  }
  return json(results);
};
