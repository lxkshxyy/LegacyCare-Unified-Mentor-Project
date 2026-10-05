import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Store, Wallet, Plus, ArrowRight, Clock } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageLoader, ProgressRing, StatCard, StatusBadge, EmptyState } from '../../components/ui';
import { inr, date } from '../../utils/format';

export default function PlannerOverview() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get('/plans').then(({ data }) => setPlans(data.plans));
    api.get('/requests').then(({ data }) => setRequests(data.requests)).catch(() => {});
  }, []);

  if (!plans) return <PageLoader />;
  const main = plans[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">Namaste, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-muted">Take your time. Everything here is saved and private.</p>
      </div>

      {!main ? (
        <EmptyState
          icon={FileText}
          title="You haven't started a plan yet"
          text="Begin whenever you feel ready. It takes about 20 minutes, and you can save and return at any step."
          action={<Link to="/planner/plans/new" className="btn-primary"><Plus className="h-4 w-4" /> Start your plan</Link>}
        />
      ) : (
        <>
          <div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <ProgressRing value={main.completion} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl">{main.title}</h2>
                <StatusBadge status={main.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {main.completion === 100 ? 'Every section is complete.' : 'A few sections are still waiting for you.'} Last updated {date(main.updatedAt)}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/planner/plans/${main._id}/edit`} className="btn-primary">Continue planning <ArrowRight className="h-4 w-4" /></Link>
                <Link to={`/planner/plans/${main._id}`} className="btn-secondary">View plan</Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Nominees" value={main.nominees.length} sub={main.nominees.map((n) => n.name).join(', ') || 'None yet'} />
            <StatCard icon={Store} label="Selected services" value={main.selectedServices.length} tone="gold" />
            <StatCard icon={Wallet} label="Estimated budget" value={inr(main.budget?.estimate)} tone="blue" />
            <StatCard icon={Clock} label="Times updated" value={main.version} tone="rose" sub="Update whenever your wishes change" />
          </div>
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">Recent requests</h2>
            <Link to="/planner/requests" className="link text-sm">View all</Link>
          </div>
          {requests.length ? (
            <ul className="divide-y divide-line">
              {requests.slice(0, 4).map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.service?.title}</p>
                    <p className="truncate text-xs text-muted">{r.provider?.provider?.businessName} · {date(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">No requests yet. You can send one from your plan.</p>}
        </div>
        <div className="card p-6">
          <h2 className="text-lg">Recent changes</h2>
          {main?.updateHistory?.length ? (
            <ul className="mt-4 space-y-3">
              {[...main.updateHistory].reverse().slice(0, 5).map((h, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sage" />
                  <span className="flex-1">{h.summary}</span>
                  <span className="text-muted">{date(h.at)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted">Nothing yet.</p>}
        </div>
      </div>
    </div>
  );
}
