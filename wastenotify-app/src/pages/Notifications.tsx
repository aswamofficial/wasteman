import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage, IonRefresher, IonRefresherContent, type RefresherEventDetail } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  toApiError,
  type AppNotification,
} from '../lib/api';

const BADGE: Record<string, { icon: string; chip: string }> = {
  verified: { icon: 'auto_awesome', chip: 'bg-brand-surface text-brand' },
  assigned: { icon: 'groups', chip: 'bg-iris-surface text-iris' },
  in_progress: { icon: 'local_shipping', chip: 'bg-brand-surface text-brand' },
  resolved: { icon: 'check_circle', chip: 'bg-grass-surface text-grass' },
  rejected: { icon: 'block', chip: 'bg-danger-surface text-danger' },
  community: { icon: 'groups', chip: 'bg-sea-surface text-sea' },
};

const Notifications: React.FC = () => {
  const history = useHistory();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotifications();
      setItems(data.notifications);
      setUnread(data.unread);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await load();
    e.detail.complete();
  };

  const open = async (n: AppNotification) => {
    if (!n.read) {
      // Optimistic: the badge should drop the moment they tap, and a failed
      // mark-read is not worth blocking navigation over.
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      markNotificationRead(n.id).catch(() => undefined);
    }
    if (n.report_id) history.push(`/reports/${n.report_id}`);
  };

  const readAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    try {
      await markAllNotificationsRead();
    } catch {
      load();
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <TopBar
          title="Notifications"
          actions={
            unread > 0 ? (
              <button type="button" onClick={readAll} className="px-2 text-[13px] font-semibold text-brand">
                Mark all read
              </button>
            ) : undefined
          }
        />

        <div className="min-h-full bg-canvas px-4 pb-32 pt-3">

          {error && (
            <div role="alert" className="mt-4 rounded-2xl bg-danger-surface px-4 py-3">
              <p className="text-[13px] text-danger">{error}</p>
            </div>
          )}

          {loading && <p className="mt-8 text-center text-[14px] text-ink-soft">Loading…</p>}

          {!loading && !items.length && !error && (
            <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
              <span className="material-symbols-outlined text-[36px] text-ink-faint">
                notifications_off
              </span>
              <p className="font-display text-[16px] font-bold text-ink">Nothing yet</p>
              <p className="text-[13px] text-ink-soft">
                We'll tell you as soon as one of your reports moves.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {items.map((n) => {
              const badge = BADGE[n.type] ?? BADGE.verified;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => open(n)}
                  className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left shadow-card active:scale-[0.99] transition-transform ${
                    n.read ? 'bg-card' : 'bg-brand-tint'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${badge.chip}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{badge.icon}</span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-[14.5px] font-bold text-ink">{n.title}</p>
                      <span className="shrink-0 text-[11px] text-ink-faint">{n.at_human}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{n.body}</p>
                  </div>

                  {n.image_url && (
                    <img
                      src={n.image_url}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </button>
              );
            })}
          </div>
        </div>
      </IonContent>
      <BottomNav active="home" />
    </IonPage>
  );
};

export default Notifications;
