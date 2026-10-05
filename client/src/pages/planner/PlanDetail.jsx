import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, Printer, Send, RotateCcw } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import PlanSummary from '../../components/PlanSummary';
import RequestModal from '../../components/RequestModal';
import { PageLoader, ConfirmModal, useToast } from '../../components/ui';

export default function PlanDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [reqItem, setReqItem] = useState(null);
  const [reopen, setReopen] = useState(false);
  const load = () => api.get(`/plans/${id}`).then(({ data }) => setData(data));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <PageLoader />;
  const { plan, documents } = data;
  return (
    <div className="mx-auto max-w-4xl">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/planner/plans" className="text-sm text-muted hover:text-ink">← My plans</Link>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Download / print</button>
          {plan.status === 'finalized' && <button className="btn-secondary" onClick={() => setReopen(true)}><RotateCcw className="h-4 w-4" /> Move to draft</button>}
          <Link to={`/planner/plans/${id}/edit`} className="btn-primary"><Pencil className="h-4 w-4" /> Edit plan</Link>
        </div>
      </div>
      <PlanSummary
        plan={plan}
        documents={documents}
        renderServiceAction={(s) => s.service?._id && (
          <button className="btn-secondary no-print px-3" onClick={() => setReqItem(s)} title="Send request"><Send className="h-4 w-4" /> <span className="hidden sm:inline">Request</span></button>
        )}
      />
      <RequestModal open={!!reqItem} item={reqItem} planId={plan._id} onClose={() => setReqItem(null)} />
      <ConfirmModal
        open={reopen}
        onClose={() => setReopen(false)}
        title="Move plan back to draft?"
        text="Your nominees will not be able to see the plan until you finalize it again."
        confirmLabel="Move to draft"
        onConfirm={async () => {
          try { await api.post(`/plans/${id}/reopen`); toast('Plan moved to draft'); setReopen(false); load(); } catch (e) { toast(errMsg(e), 'error'); }
        }}
      />
    </div>
  );
}
