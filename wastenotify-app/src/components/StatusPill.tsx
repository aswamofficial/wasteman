import type { ReportStatus } from '../lib/api';

/*
 * Status system:
 *   PENDING     amber — needs attention
 *   IN PROGRESS blue  — a crew is on it
 *   RESOLVED    green — done
 * Colour never carries the meaning alone; the label is always rendered too.
 */
const STYLES: Record<ReportStatus, string> = {
  pending: 'bg-flag-surface text-flag',
  in_progress: 'bg-brand-surface text-brand',
  resolved: 'bg-grass-surface text-grass-dark',
  rejected: 'bg-danger-surface text-danger',
};

const StatusPill: React.FC<{ status: ReportStatus; label?: string }> = ({ status, label }) => (
  <span
    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
      STYLES[status] ?? STYLES.pending
    }`}
  >
    {label ?? status}
  </span>
);

export default StatusPill;
