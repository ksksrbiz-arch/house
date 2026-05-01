import type { Env } from './_helpers';
import { json, handleCors } from './_helpers';

/** GET /api/deals — list all deals, ordered by created_at desc */
/** POST /api/deals — upsert a deal */
/** PUT /api/deals — upsert a deal (alias) */

export const onRequestOptions: PagesFunction<Env> = async () => handleCors();

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const row = await env.DB.prepare('SELECT * FROM deals WHERE id = ?').bind(id).first();
    if (!row) return json({ error: 'Deal not found' }, 404);
    return json(row);
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM deals ORDER BY created_at DESC'
  ).all();
  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json() as Record<string, unknown>;
  const id = (body.id as string) || crypto.randomUUID().replace(/-/g, '');

  const now = new Date().toISOString();
  const row = await env.DB.prepare(`
    INSERT INTO deals (id, address, city, state, zip, asking_price, units, stage, pha_id, assigned_to, notes, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?12)
    ON CONFLICT(id) DO UPDATE SET
      address = excluded.address,
      city = excluded.city,
      state = excluded.state,
      zip = excluded.zip,
      asking_price = excluded.asking_price,
      units = excluded.units,
      stage = excluded.stage,
      pha_id = excluded.pha_id,
      assigned_to = excluded.assigned_to,
      notes = excluded.notes,
      updated_at = excluded.updated_at
    RETURNING *
  `).bind(
    id,
    body.address ?? '',
    body.city ?? '',
    body.state ?? null,
    body.zip ?? null,
    body.asking_price ?? 0,
    body.units ?? 1,
    body.stage ?? 'prospecting',
    body.pha_id ?? null,
    body.assigned_to ?? null,
    body.notes ?? null,
    now,
  ).first();

  return json(row, 201);
};

export const onRequestPut = onRequestPost;
