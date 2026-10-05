import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { PageHeader, PageLoader, EmptyState, StatusBadge, Modal, Textarea, useToast } from '../../components/ui';
import { date } from '../../utils/format';

export default function AdminProviders() {
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [providers, setProviders] = useState(null);
  const [reject, setReject] = useState(null);
  const [note, setNote] = useState('');
  const load = () => api.get('/admin/users', { params: { role: 'provider', verification: tab || undefined } }).then(({ data }) => setProviders(data.users));
  useEffect(() => { setProviders(null); load(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const decide = async (p, status, n) => {
    try { await api.patch(`/admin/providers/${p._id}/verification`, { status, note: n }); toast(`Provider ${status}`); setReject(null); setNote(''); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <PageHeader title="Provider verification" subtitle="Check business and licence details before listings go live." />
      <div className="mb-4 flex flex-wrap gap-2">
        {[['pending', 'Pending'], ['verified', 'Verified'], ['rejected', 'Rejected'], ['', 'All']].map(([v, l]) => (
          <button key={l} onClick={() => setTab(v)} className={`rounded-full px-3 py-1.5 text-sm ${tab === v ? 'bg-sage text-white' : 'border border-line bg-white text-ink-soft hover:bg-sand'}`}>{l}</button>
        ))}
      </div>
      {!providers ? <PageLoader /> : !providers.length ? <EmptyState icon={ShieldCheck} title="Nothing here" text={tab === 'pending' ? 'No providers are waiting for verification.' : undefined} /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {providers.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg">{p.provider?.businessName}</h3>
                  <p className="text-sm text-muted">{p.name} · {p.email}{p.phone && ` · ${p.phone}`}</p>
                </div>
                <StatusBadge status={p.provider?.verificationStatus} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted">Licence no.</dt><dd className="font-medium">{p.provider?.licenseNumber || '— not provided'}</dd></div>
                <div><dt className="text-muted">City / areas</dt><dd className="font-medium">{(p.provider?.serviceAreas || []).join(', ') || p.city || '—'}</dd></div>
                <div><dt className="text-muted">Registered</dt><dd>{date(p.createdAt)}</dd></div>
                <div><dt className="text-muted">Verified on</dt><dd>{date(p.provider?.verifiedAt)}</dd></div>
              </dl>
              {p.provider?.description && <p className="mt-3 text-sm text-ink-soft">{p.provider.description}</p>}
              {p.provider?.verificationNote && <p className="mt-2 text-sm text-muted">Note: {p.provider.verificationNote}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.provider?.verificationStatus !== 'verified' && <button className="btn-primary" onClick={() => decide(p, 'verified')}>Approve</button>}
                {p.provider?.verificationStatus !== 'rejected' && <button className="btn-secondary" onClick={() => setReject(p)}>Reject</button>}
                {p.provider?.verificationStatus !== 'pending' && <button className="btn-ghost" onClick={() => decide(p, 'pending')}>Move to review</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!reject} onClose={() => setReject(null)} title={`Reject ${reject?.provider?.businessName}?`}
        footer={<><button className="btn-secondary" onClick={() => setReject(null)}>Cancel</button><button className="btn-danger" onClick={() => decide(reject, 'rejected', note)}>Reject provider</button></>}>
        <Textarea label="Reason (shared with the provider)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Licence number could not be verified" />
      </Modal>
    </>
  );
}
