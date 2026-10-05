import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { PageHeader, PageLoader, EmptyState, StatusBadge, ConfirmModal, useToast } from '../../components/ui';
import { dateTime, date, inr, SERVICE_CATEGORIES } from '../../utils/format';

export default function Requests() {
  const toast = useToast();
  const [requests, setRequests] = useState(null);
  const [status, setStatus] = useState('');
  const [cancel, setCancel] = useState(null);
  const load = () => api.get('/requests', { params: status ? { status } : {} }).then(({ data }) => setRequests(data.requests));
  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHeader title="Service requests" subtitle="Requests you have sent to providers, and their replies." />
      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'pending', 'accepted', 'declined', 'completed', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-sm capitalize ${status === s ? 'bg-sage text-white' : 'bg-white text-ink-soft border border-line hover:bg-sand'}`}>{s || 'All'}</button>
        ))}
      </div>
      {!requests ? <PageLoader /> : !requests.length ? (
        <EmptyState icon={Send} title="No requests" text="Open a plan and choose “Request” next to a selected service." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-sans font-semibold">{r.service?.title}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-muted">
                    {r.provider?.provider?.businessName} · {SERVICE_CATEGORIES[r.service?.category]} · {inr(r.service?.price)} · Plan: {r.plan?.title}
                  </p>
                  {r.message && <p className="mt-2 text-sm text-ink-soft">“{r.message}”</p>}
                  {r.providerNote && <p className="mt-2 rounded-xl bg-sage-light px-3 py-2 text-sm text-sage-dark">Provider: {r.providerNote}</p>}
                  <p className="mt-2 text-xs text-muted">Sent {dateTime(r.createdAt)}{r.preferredDate && ` · Preferred date ${date(r.preferredDate)}`}</p>
                </div>
                {['pending', 'accepted'].includes(r.status) && (
                  <button className="btn-secondary shrink-0" onClick={() => setCancel(r)}>Cancel request</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={!!cancel}
        onClose={() => setCancel(null)}
        title="Cancel this request?"
        text="The provider will be informed."
        confirmLabel="Cancel request"
        danger
        onConfirm={async () => {
          try { await api.patch(`/requests/${cancel._id}/status`, { status: 'cancelled' }); toast('Request cancelled'); setCancel(null); load(); } catch (e) { toast(errMsg(e), 'error'); }
        }}
      />
    </>
  );
}
