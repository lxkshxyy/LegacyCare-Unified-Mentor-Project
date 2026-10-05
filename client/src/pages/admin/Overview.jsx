import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileCheck2, RefreshCw, ShieldCheck, Star, AlertTriangle, Store, Clock } from 'lucide-react';
import api from '../../api/client';
import { PageHeader, PageLoader, StatCard, BarList } from '../../components/ui';

export default function AdminOverview() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then(({ data }) => setS(data)); }, []);
  if (!s) return <PageLoader />;
  const k = s.kpis;
  const maxSignup = Math.max(1, ...s.signupsByMonth.map((m) => m.count));
  return (
    <div className="space-y-6">
      <PageHeader title="Platform overview" subtitle="Key performance indicators from the project brief." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Users} label="Registered users" value={k.registeredUsers} />
        <StatCard icon={FileCheck2} label="Completed plans" value={k.completedPlans} tone="blue" />
        <StatCard icon={RefreshCw} label="Avg. updates / plan" value={k.avgPlanUpdates} sub={`${k.planUpdatesLast30Days} updates in last 30 days`} tone="gold" />
        <StatCard icon={ShieldCheck} label="Verified providers" value={k.verifiedProviders} />
        <StatCard icon={Star} label="Satisfaction" value={`${k.satisfaction} / 5`} sub={`${k.feedbackCount} ratings`} tone="gold" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/providers" className="card flex items-center gap-4 p-5 hover:border-sage">
          <Clock className="h-6 w-6 text-gold" /><div><p className="font-serif text-2xl">{s.pendingProviders}</p><p className="text-sm text-muted">Providers awaiting verification</p></div>
        </Link>
        <Link to="/admin/disputes" className="card flex items-center gap-4 p-5 hover:border-sage">
          <AlertTriangle className="h-6 w-6 text-rose" /><div><p className="font-serif text-2xl">{s.openDisputes}</p><p className="text-sm text-muted">Open disputes</p></div>
        </Link>
        <div className="card flex items-center gap-4 p-5">
          <Store className="h-6 w-6 text-sage" /><div><p className="font-serif text-2xl">{s.activeListings}</p><p className="text-sm text-muted">Active service listings</p></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6"><h2 className="mb-4 text-lg">Users by role</h2><BarList data={s.usersByRole} /></div>
        <div className="card p-6"><h2 className="mb-4 text-lg">Plans by status</h2><BarList data={s.plansByStatus} color="bg-gold" /></div>
        <div className="card p-6"><h2 className="mb-4 text-lg">Requests by status</h2><BarList data={s.requestsByStatus} color="bg-[#3b5a80]" /></div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg">Sign-ups (last 6 months)</h2>
        {s.signupsByMonth.length ? (
          <div className="flex h-48 items-end gap-3">
            {s.signupsByMonth.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium">{m.count}</span>
                <div className="w-full max-w-16 rounded-t-lg bg-sage" style={{ height: `${(m.count / maxSignup) * 140}px` }} />
                <span className="text-xs text-muted">{m.month}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted">No sign-ups yet.</p>}
      </div>
      <p className="text-xs text-muted">Privacy note: administrators can see counts and statuses, but never the content of anyone's plan.</p>
    </div>
  );
}
