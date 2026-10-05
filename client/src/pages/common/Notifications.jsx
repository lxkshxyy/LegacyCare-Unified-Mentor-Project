import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../api/client';
import { PageHeader, PageLoader, EmptyState } from '../../components/ui';
import { dateTime } from '../../utils/format';

export default function Notifications() {
  const [data, setData] = useState(null);
  const load = () => api.get('/notifications').then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);
  const readAll = async () => { await api.patch('/notifications/read-all'); load(); };
  const read = (n) => !n.read && api.patch(`/notifications/${n._id}/read`);

  if (!data) return <PageLoader />;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle={`${data.unread} unread`} actions={data.unread > 0 && <button className="btn-secondary" onClick={readAll}><CheckCheck className="h-4 w-4" /> Mark all as read</button>} />
      {!data.notifications.length ? <EmptyState icon={Bell} title="You're all caught up" /> : (
        <ul className="card divide-y divide-line">
          {data.notifications.map((n) => {
            const body = (
              <div className="flex gap-3 px-5 py-4">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-line' : 'bg-gold'}`} />
                <div className="flex-1">
                  <p className={n.read ? 'text-ink-soft' : 'font-medium'}>{n.message}</p>
                  <p className="text-xs text-muted">{dateTime(n.createdAt)}</p>
                </div>
              </div>
            );
            return (
              <li key={n._id} className="hover:bg-ivory">
                {n.link ? <Link to={n.link} onClick={() => read(n)}>{body}</Link> : <button className="w-full text-left" onClick={() => { read(n); load(); }}>{body}</button>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
