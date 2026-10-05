import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Pencil, Eye, Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { PageHeader, PageLoader, EmptyState, StatusBadge, ConfirmModal, useToast } from '../../components/ui';
import { inr, date } from '../../utils/format';

export default function Plans() {
  const [plans, setPlans] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const toast = useToast();
  const load = () => api.get('/plans').then(({ data }) => setPlans(data.plans));
  useEffect(() => { load(); }, []);

  if (!plans) return <PageLoader />;
  return (
    <>
      <PageHeader title="My plans" subtitle="Most people keep one plan. You can create more if you wish." actions={<Link to="/planner/plans/new" className="btn-primary"><Plus className="h-4 w-4" /> New plan</Link>} />
      {!plans.length ? (
        <EmptyState icon={FileText} title="No plans yet" text="Start whenever you feel ready." action={<Link to="/planner/plans/new" className="btn-primary">Start your plan</Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p._id} className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl">{p.title}</h2>
                  <p className="text-sm text-muted">Updated {date(p.updatedAt)} · v{p.version}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-4 h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-sage" style={{ width: `${p.completion}%` }} /></div>
              <p className="mt-1 text-xs text-muted">{p.completion}% complete</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-ivory p-2"><dt className="text-muted">Services</dt><dd className="font-medium">{p.selectedServices.length}</dd></div>
                <div className="rounded-xl bg-ivory p-2"><dt className="text-muted">Nominees</dt><dd className="font-medium">{p.nominees.length}</dd></div>
                <div className="rounded-xl bg-ivory p-2"><dt className="text-muted">Budget</dt><dd className="font-medium">{inr(p.budget?.estimate)}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/planner/plans/${p._id}`} className="btn-secondary"><Eye className="h-4 w-4" /> View</Link>
                <Link to={`/planner/plans/${p._id}/edit`} className="btn-secondary"><Pencil className="h-4 w-4" /> Edit</Link>
                <button className="btn-ghost text-rose" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this plan?"
        text={`"${toDelete?.title}" and its documents will be permanently deleted. Your nominees will no longer be able to see it.`}
        confirmLabel="Delete plan"
        danger
        onConfirm={async () => {
          try {
            await api.delete(`/plans/${toDelete._id}`);
            toast('Plan deleted');
            setToDelete(null);
            load();
          } catch (e) { toast(errMsg(e), 'error'); }
        }}
      />
    </>
  );
}
