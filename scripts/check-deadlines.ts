#!/usr/bin/env tsx
/**
 * check-deadlines.ts
 * Fetches overdue compliance deadlines from Supabase and posts GitHub Issues.
 * Invoked by the daily-deadlines.yml workflow (or manually).
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO ?? 'ksksrbiz-arch/house';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface OverdueDeadline {
  id: string;
  deal_id: string;
  address: string;
  city: string;
  state: string;
  deadline_type: string;
  due_date: string;
  days_overdue: number;
  notes?: string;
}

async function createGitHubIssue(deadline: OverdueDeadline): Promise<string | null> {
  if (!GITHUB_TOKEN) {
    console.log(`[DRY RUN] Would create issue: ${deadline.deadline_type} for ${deadline.address}`);
    return null;
  }

  const title = `⚠️ Overdue: ${deadline.deadline_type.replace(/_/g, ' ')} — ${deadline.address}, ${deadline.city}`;
  const body = [
    `## Overdue Compliance Deadline`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| **Type** | ${deadline.deadline_type.replace(/_/g, ' ')} |`,
    `| **Property** | ${deadline.address}, ${deadline.city}, ${deadline.state} |`,
    `| **Due Date** | ${deadline.due_date} |`,
    `| **Days Overdue** | ${deadline.days_overdue} |`,
    deadline.notes ? `| **Notes** | ${deadline.notes} |` : '',
    ``,
    `---`,
    `*Auto-posted by check-deadlines.ts — Cathedral Acquisitions*`,
  ]
    .filter(Boolean)
    .join('\n');

  const resp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'cathedral-check-deadlines',
    },
    body: JSON.stringify({ title, body, labels: ['compliance', 'overdue'] }),
  });

  if (!resp.ok) {
    console.error(`Failed to create issue: ${resp.status} ${await resp.text()}`);
    return null;
  }

  const issue = await resp.json() as { html_url: string };
  return issue.html_url;
}

async function main() {
  const { data: deadlines, error } = await supabase
    .from('overdue_deadlines')
    .select('*');

  if (error) {
    console.error('Error fetching overdue deadlines:', error.message);
    process.exit(1);
  }

  if (!deadlines || deadlines.length === 0) {
    console.log('✅ No overdue deadlines found.');
    return;
  }

  console.log(`Found ${deadlines.length} overdue deadline(s).`);

  for (const deadline of deadlines as OverdueDeadline[]) {
    const url = await createGitHubIssue(deadline);
    if (url) {
      console.log(`✅ Created issue: ${url}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
