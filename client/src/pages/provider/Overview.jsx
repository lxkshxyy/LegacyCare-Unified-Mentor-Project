import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Clock, CheckCircle2, ThumbsUp, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageLoader, StatCard, StatusBadge } from '../../components/ui';
import { dateTime } from '../../utils/format';

export function VerificationBanner({ user }) {
  const s = user.provider?.verificationStatus;
  if (s === 'verified') return (
    <div className="flex items-start gap-3 rounded-2xl bg-sage-light p-4 text-sage-dark"><ShieldCheck className="h-5 w-5 shrink-0" /><p><b>Verified provider.</b> Your active listings are visible to families.</p></div>
  );
  if (s === 'rejected') return (
    <div className="flex items-start gap-3 rounded-2xl bg-rose-light p-4 text-[#8c4f5b]"><ShieldX className="h-5 w-5 shrink-0" /><p><b>Verification not approved.</b> {user.provider?.verificationNote} Update your details under Account and raise an issue to request a review.</p></div>
  );
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gold-light p-4 text-[#8a6d2f]"><ShieldAlert className="h-5 w-5 shrink-0" /><p><b>Verification pending.</b> You can add listings now; they will become visible once our team verifies your business (usually 1–2 working days).</p></div>
  );
}

export default function ProviderOverview() {
  const { user, refresh } = useAuth();
  const [services, setServices] = useState(null);
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    refresh();
    api.get('/services/mine/list').then(({ data }) => setServices(data.services));
    api.get('/requests').then(({ data }) => setRequests(data.requests));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!services) return <PageLoader />;
  const count = (s) => requests.filter((r) => r.status === s).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">{user.provider?.businessName}</h1>
        <p className="text-muted">Welcome back, {user.name}.</p>
      </div>
      <VerificationBanner user={user} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Store} label="Active listings" value={services.filter((s) => s.isActive).length} />
        <StatCard icon={Clock} label="Pending requests" value={count('pending')} tone="gold" />
        <StatCard icon={ThumbsUp} label="Accepted" value={count('accepted')} tone="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={count('completed')} tone="sage" />
      </div>
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg">Latest requests</h2>
          <Link className="link text-sm" to="/provider/requests">Manage requests</Link>
        </div>
        {requests.length ? (
          <ul className="divide-y divide-line">
            {requests.slice(0, 6).map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.service?.title}</p>
                  <p className="truncate text-sm text-muted">{r.requester?.name} · {dateTime(r.createdAt)}</p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">No requests yet.</p>}
      </div>
    </div>
  );
}
