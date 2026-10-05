import { useEffect, useState } from 'react';
import { Inbox, Phone, Mail } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { PageHeader, PageLoader, EmptyState, StatusBadge, Modal, Textarea, Badge, useToast } from '../../components/ui';
import { dateTime, date } from '../../utils/format';

const ACTIONS = {
  pending: [['accepted', 'Accept', 'btn-primary'], ['declined', 'Decline', 'btn-secondary']],
  accepted: [['completed', 'Mark completed', 'btn-primary'], ['declined', 'Decline', 'btn-secondary']],
};

export default function ProviderRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState(null);
  const [status, setStatus] = useState('');
  const [action, setAction] = useState(null);
  const [note, setNote] = useState('');
  const load = () => api.get('/requests', { params: status ? { status } : {} }).then(({ data }) => setRequests(data.requests));
  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    try {
      await api.patch(`/requests/${action.r._id}/status`, { status: action.status, note });
      toast(`Request ${action.status}`);
      setAction(null);
      setNote('');
      load();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <PageHeader title="Service requests" subtitle="Respond promptly and kindly — families are often going through a hard time." />
      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'pending', 'accepted', 'completed', 'declined', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-sm capitalize ${status === s ? 'bg-sage text-white' : 'border border-line bg-white text-ink-soft hover:bg-sand'}`}>{s || 'All'}</button>
        ))}
      </div>
      {!requests ? <PageLoader /> : !requests.length ? <EmptyState icon={Inbox} title="No requests here" /> : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-sans font-semibold">{r.service?.title}</h3>
                    <StatusBadge status={r.status} />
                    <Badge tone={r.type === 'execution' ? 'rose' : 'gray'}>{r.type === 'execution' ? 'Immediate need' : 'Pre-booking'}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">From <b>{r.requester?.name}</b>{r.requester?.city && `, ${r.requester.city}`} · Plan location: {r.plan?.location?.city || '—'}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                    {r.requester?.phone && <a className="flex items-center gap-1 text-sage-dark" href={`tel:${r.requester.phone}`}><Phone className="h-3.5 w-3.5" /> {r.requester.phone}</a>}
                    {r.requester?.email && <a className="flex items-center gap-1 text-sage-dark" href={`mailto:${r.requester.email}`}><Mail className="h-3.5 w-3.5" /> {r.requester.email}</a>}
                  </div>
                  {r.message && <p className="mt-2 text-sm text-ink-soft">“{r.message}”</p>}
                  {r.providerNote && <p className="mt-2 text-sm text-muted">Your note: {r.providerNote}</p>}
                  <p className="mt-2 text-xs text-muted">Received {dateTime(r.createdAt)}{r.preferredDate && ` · Preferred date ${date(r.preferredDate)}`}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {(ACTIONS[r.status] || []).map(([s, label, cls]) => (
                    <button key={s} className={cls} onClick={() => setAction({ r, status: s })}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={`Mark request as ${action?.status}`}
        footer={<><button className="btn-secondary" onClick={() => setAction(null)}>Cancel</button><button className="btn-primary" onClick={submit}>Confirm</button></>}
      >
        <Textarea label="Note to the family (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Confirmed. Our coordinator will call you." />
      </Modal>
    </>
  );
}
