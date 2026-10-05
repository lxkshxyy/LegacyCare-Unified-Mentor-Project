import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer, Send, ListChecks } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import PlanSummary from '../../components/PlanSummary';
import RequestModal from '../../components/RequestModal';
import { PageLoader, EmptyState } from '../../components/ui';

const GUIDE = [
  ['Take a moment', 'There is no rush in the first hour. Call a close family member or friend to be with you.'],
  ['Obtain the medical certificate', 'A doctor (or hospital) issues the certificate of cause of death. Keep several photocopies.'],
  ['Inform the people listed', 'Share the news with the people mentioned in the instructions.'],
  ['Contact the chosen providers', 'Use the call / email buttons below, or send a request so they can confirm.'],
  ['Arrange the officiant', 'Reach out to the pandit / priest / celebrant named in the plan.'],
  ['Follow the ceremony instructions', 'Music, prayers, customs and dress code are listed below.'],
  ['Handle donations & documents', 'Check the documents section for pledge cards or letters.'],
  ['Register the death', 'Apply for the death certificate with the local municipal office within 21 days.'],
];

export default function NomineePlan() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reqItem, setReqItem] = useState(null);
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`lc_guide_${id}`) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    api.get(`/plans/${id}`).then(({ data }) => setData(data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  const toggle = (i) => {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    setDone(next);
    try { localStorage.setItem(`lc_guide_${id}`, JSON.stringify(next)); } catch { /* ignore */ }
  };

  if (error) return <EmptyState title="This plan is not available" text={error} action={<Link to="/nominee" className="btn-secondary">Back</Link>} />;
  if (!data) return <PageLoader />;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1fr_320px]">
      <div>
        <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/nominee" className="text-sm text-muted hover:text-ink">← Shared with me</Link>
          <button className="btn-secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Download / print instructions</button>
        </div>
        <PlanSummary
          plan={data.plan}
          documents={data.documents}
          showNomineeDetails={false}
          renderServiceAction={(s) => s.service?._id && (
            <button className="btn-secondary no-print px-3" onClick={() => setReqItem(s)}><Send className="h-4 w-4" /> <span className="hidden sm:inline">Request</span></button>
          )}
        />
      </div>
      <aside className="no-print xl:sticky xl:top-24 xl:self-start">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 text-lg"><ListChecks className="h-5 w-5 text-sage" /> What to do now</h2>
          <p className="mt-1 text-sm text-muted">A gentle guide. Tick steps as you go — {done.length}/{GUIDE.length} done.</p>
          <ol className="mt-4 space-y-3">
            {GUIDE.map(([t, d], i) => (
              <li key={t}>
                <label className="flex cursor-pointer gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sage" checked={done.includes(i)} onChange={() => toggle(i)} />
                  <span>
                    <span className={`block text-sm font-medium ${done.includes(i) ? 'text-muted line-through' : ''}`}>{t}</span>
                    <span className="block text-xs text-muted">{d}</span>
                  </span>
                </label>
              </li>
            ))}
          </ol>
        </div>
      </aside>
      <RequestModal open={!!reqItem} item={reqItem} planId={data.plan._id} onClose={() => setReqItem(null)} />
    </div>
  );
}
