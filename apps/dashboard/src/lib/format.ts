/** Format a number as USD currency */
export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format a percentage */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format an ISO date string as readable date */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Days until a due date (negative = overdue) */
export function daysUntil(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Stage labels */
export const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospecting',
  under_contract: 'Under Contract',
  due_diligence: 'Due Diligence',
  financing: 'Financing',
  closing: 'Closing',
  closed: 'Closed',
  dead: 'Dead',
};

export const STAGE_COLORS: Record<string, string> = {
  prospecting: 'bg-gray-100 text-gray-700',
  under_contract: 'bg-blue-100 text-blue-700',
  due_diligence: 'bg-yellow-100 text-yellow-700',
  financing: 'bg-purple-100 text-purple-700',
  closing: 'bg-orange-100 text-orange-700',
  closed: 'bg-green-100 text-green-700',
  dead: 'bg-red-100 text-red-700',
};
