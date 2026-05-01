import type { Env } from './_helpers';
import { json, handleCors } from './_helpers';

export const onRequestOptions: PagesFunction<Env> = async () => handleCors();

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const dealId = url.searchParams.get('deal_id');

  let results;
  if (dealId) {
    ({ results } = await env.DB.prepare(
      'SELECT * FROM deal_documents WHERE deal_id = ? ORDER BY created_at DESC'
    ).bind(dealId).all());
  } else {
    ({ results } = await env.DB.prepare(
      'SELECT * FROM deal_documents ORDER BY created_at DESC'
    ).all());
  }
  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json() as Record<string, unknown>;
  const id = crypto.randomUUID().replace(/-/g, '');
  const now = new Date().toISOString();

  const row = await env.DB.prepare(`
    INSERT INTO deal_documents (id, deal_id, name, doc_type, storage_key, uploaded_by, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    RETURNING *
  `).bind(
    id,
    body.deal_id ?? null,
    body.name ?? '',
    body.doc_type ?? null,
    body.storage_key ?? '',
    body.uploaded_by ?? null,
    now,
  ).first();

  return json(row, 201);
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'id parameter required' }, 400);

  await env.DB.prepare('DELETE FROM deal_documents WHERE id = ?').bind(id).run();
  return json({ deleted: true });
};
