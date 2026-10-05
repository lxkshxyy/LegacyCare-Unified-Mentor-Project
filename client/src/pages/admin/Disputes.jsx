import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { PageHeader, PageLoader, EmptyState, StatusBadge, Badge, Modal, Select, Textarea, useToast } from '../../components/ui';
import { dateTime } from '../../utils/format';

export default function AdminDisputes() {
  const toast = useToast();
  const [disputes, setDisputes] = useState(null);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const load = () => api.get('/admin/disputes', { params: status ? { status } : {} }).then(({ data }) => setDisputes(data.disputes));
  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    try { await api.patch(`/admin/disputes/${editing._id}`, { status: editing.status, resolution: editing.resolution }); toast('Dispute updated'); setEditing(null); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <PageHeader title="Disputes & escalations" subtitle="Handle every concern with care and fairness." />
      <div className="mb-4 flex flex-wrap gap-2">
        {[['', 'All'], ['open', 'Open'], ['in-review', 'In review'], ['resolved', 'Resolved']].map(([v, l]) => (
          <button key={l} onClick={() => setStatus(v)} className={`rounded-full px-3 py-1.5 text-sm ${status === v ? 'bg-sage text-white' : 'border border-line bg-white text-ink-soft hover:bg-sand'}`}>{l}</button>
        ))}
      </div>
      {!disputes ? <PageLoader /> : !disputes.length ? <EmptyState icon={AlertTriangle} title="No disputes" text="Nothing needs your attention." /> : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-sans font-semibold">{d.subject}</h3>
                    <StatusBadge status={d.status} />
                    <Badge tone={d.priority === 'high' ? 'rose' : d.priority === 'medium' ? 'gold' : 'gray'}>{d.priority} priority</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Raised by {d.raisedBy?.name} ({d.raisedBy?.role}){d.against && ` against ${d.against.provider?.businessName || d.against.name}`} · {dateTime(d.createdAt)}
                  </p>
                  <p className="mt-2 text-ink-soft">{d.message}</p>
                  {d.resolution && <p className="mt-2 rounded-xl bg-sage-light px-3 py-2 text-sm text-sage-dark">Resolution: {d.resolution}</p>}
                </div>
                <button className="btn-secondary shrink-0" onClick={() => setEditing({ ...d, resolution: d.resolution || '' })}>Update</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Update dispute"
        footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {editing && (
          <div className="space-y-4">
            <Select label="Status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} options={{ open: 'Open', 'in-review': 'In review', resolved: 'Resolved' }} />
            <Textarea label="Resolution / note to the user" rows={4} value={editing.resolution} onChange={(e) => setEditing({ ...editing, resolution: e.target.value })} />
          </div>
        )}
      </Modal>
    </>
  );
}
