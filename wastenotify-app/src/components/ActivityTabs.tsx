/**
 * The Activity section has two views — the report list and the impact stats.
 * They share a nav slot, so this segmented control is what makes them read as
 * one section rather than two unrelated screens.
 */
const TABS = [
  { key: 'reports', label: 'My reports', to: '/reports' },
  { key: 'impact', label: 'Impact', to: '/statistics' },
] as const;

export type ActivityTab = (typeof TABS)[number]['key'];

const ActivityTabs: React.FC<{
  active: ActivityTab;
  onNavigate: (to: string) => void;
}> = ({ active, onNavigate }) => (
  <div className="mt-3 flex gap-2" role="tablist">
    {TABS.map((t) => {
      const on = active === t.key;
      return (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={on}
          onClick={() => !on && onNavigate(t.to)}
          className={`flex-1 rounded-full py-2 text-[13.5px] font-semibold transition-colors ${
            on ? 'bg-ink text-white' : 'border border-line bg-card text-ink-soft'
          }`}
        >
          {t.label}
        </button>
      );
    })}
  </div>
);

export default ActivityTabs;
