import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const GITHUB_REPO = Deno.env.get('GITHUB_REPO') ?? 'ksksrbiz-arch/house';

Deno.serve(async (_req) => {
  try {
    // Fetch overdue deadlines
    const { data: deadlines, error } = await supabase
      .from('overdue_deadlines')
      .select('*');

    if (error) throw error;
    if (!deadlines || deadlines.length === 0) {
      return new Response(JSON.stringify({ message: 'No overdue deadlines', count: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const issues: string[] = [];

    for (const dl of deadlines) {
      if (!GITHUB_TOKEN) {
        console.log(`[SKIP] Would create issue for: ${dl.deadline_type} on ${dl.address}`);
        continue;
      }

      const title = `⚠️ Overdue: ${dl.deadline_type.replace(/_/g, ' ')} — ${dl.address}, ${dl.city}`;
      const body = [
        `## Overdue Compliance Deadline`,
        ``,
        `**Type:** ${dl.deadline_type.replace(/_/g, ' ')}`,
        `**Property:** ${dl.address}, ${dl.city}, ${dl.state}`,
        `**Due Date:** ${dl.due_date}`,
        `**Days Overdue:** ${dl.days_overdue}`,
        `**Deal ID:** ${dl.deal_id}`,
        dl.notes ? `\n**Notes:** ${dl.notes}` : '',
        ``,
        `---`,
        `*Posted by deadline-watcher edge function*`,
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
        const issue = await resp.json();
        issues.push(issue.html_url);
      }
    }

    return new Response(
      JSON.stringify({ message: `Processed ${deadlines.length} overdue deadlines`, issues }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
