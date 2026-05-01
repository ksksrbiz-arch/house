import type { Env } from './_helpers';
import { json } from './_helpers';

/**
 * POST /api/deadline-watcher
 * Monitors overdue compliance deadlines and creates GitHub Issues.
 * Replaces supabase/functions/deadline-watcher.
 */
export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results: deadlines } = await env.DB.prepare(`
      SELECT cd.id, cd.deal_id, d.address, d.city, d.state,
             cd.deadline_type, cd.due_date,
             julianday('now') - julianday(cd.due_date) AS days_overdue,
             cd.notes
      FROM compliance_deadlines cd
      JOIN deals d ON d.id = cd.deal_id
      WHERE cd.completed_at IS NULL AND cd.due_date < date('now')
      ORDER BY cd.due_date
    `).all();

    if (!deadlines || deadlines.length === 0) {
      return json({ message: 'No overdue deadlines', count: 0 });
    }

    const GITHUB_TOKEN = env.GITHUB_TOKEN;
    const GITHUB_REPO = env.GITHUB_REPO ?? 'ksksrbiz-arch/house';
    const issues: string[] = [];

    for (const dl of deadlines as Array<Record<string, unknown>>) {
      if (!GITHUB_TOKEN) {
        console.log(`[SKIP] Would create issue for: ${dl.deadline_type} on ${dl.address}`);
        continue;
      }

      const title = `⚠️ Overdue: ${(dl.deadline_type as string).replace(/_/g, ' ')} — ${dl.address}, ${dl.city}`;
      const body = [
        `## Overdue Compliance Deadline`,
        ``,
        `**Type:** ${(dl.deadline_type as string).replace(/_/g, ' ')}`,
        `**Property:** ${dl.address}, ${dl.city}, ${dl.state}`,
        `**Due Date:** ${dl.due_date}`,
        `**Days Overdue:** ${Math.round(dl.days_overdue as number)}`,
        `**Deal ID:** ${dl.deal_id}`,
        dl.notes ? `\n**Notes:** ${dl.notes}` : '',
        ``,
        `---`,
        `*Posted by deadline-watcher worker*`,
      ].join('\n');

      const resp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'cathedral-deadline-watcher',
        },
        body: JSON.stringify({ title, body, labels: ['compliance', 'overdue'] }),
      });

      if (resp.ok) {
        const issue = await resp.json() as { html_url: string };
        issues.push(issue.html_url);
      }
    }

    return json({ message: `Processed ${deadlines.length} overdue deadlines`, issues });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
};
