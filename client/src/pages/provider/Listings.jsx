import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Store } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, PageLoader, EmptyState, Modal, Input, Select, Textarea, Toggle, Badge, ConfirmModal, Spinner, useToast } from '../../components/ui';
import { inr, SERVICE_CATEGORIES, PRICE_UNITS } from '../../utils/format';
import { VerificationBanner } from './Overview';

const UNITS = { 'per-service': 'Per service', 'per-km': 'Per km', 'per-hour': 'Per hour', 'per-person': 'Per person', package: 'Package' };

export default function Listings() {
  const { user } = useAuth();
  const toast = useToast();
  const [services, setServices] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.get('/services/mine/list').then(({ data }) => setServices(data.services.filter((s) => s.isActive)));
  useEffect(() => { load(); }, []);

  const blank = { title: '', category: 'funeral-agency', price: '', priceUnit: 'per-service', city: user.city || '', description: '', traditions: '', isAvailable: true, availabilityNote: '' };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = { ...editing, price: Number(editing.price) };
    try {
      if (editing._id) await api.put(`/services/${editing._id}`, payload);
      else await api.post('/services', payload);
      toast(editing._id ? 'Listing updated' : 'Listing added');
      setEditing(null);
      load();
    } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };
  const toggleAvail = async (s) => {
    await api.put(`/services/${s._id}`, { isAvailable: !s.isAvailable });
    load();
  };

  if (!services) return <PageLoader />;
  return (
    <>
      <PageHeader title="My listings" subtitle="Clear prices help families plan with confidence." actions={<button className="btn-primary" onClick={() => setEditing(blank)}><Plus className="h-4 w-4" /> Add listing</button>} />
      {user.provider?.verificationStatus !== 'verified' && <div className="mb-5"><VerificationBanner user={user} /></div>}
      {!services.length ? (
        <EmptyState icon={Store} title="No listings yet" text="Add the services you offer with transparent pricing." action={<button className="btn-primary" onClick={() => setEditing(blank)}>Add your first listing</button>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-5 py-3">Service</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Availability</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {services.map((s) => (
                <tr key={s._id}>
                  <td className="px-5 py-4 font-medium">{s.title}</td>
                  <td className="px-5 py-4"><Badge>{SERVICE_CATEGORIES[s.category]}</Badge></td>
                  <td className="px-5 py-4 whitespace-nowrap">{inr(s.price)} <span className="text-xs text-muted">{PRICE_UNITS[s.priceUnit]}</span></td>
                  <td className="px-5 py-4">{s.city}</td>
                  <td className="px-5 py-4"><Toggle checked={s.isAvailable} onChange={() => toggleAvail(s)} label={s.isAvailable ? 'Available' : 'Unavailable'} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-2 text-muted hover:bg-sand" onClick={() => setEditing({ ...s, traditions: (s.traditions || []).join(', ') })} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button className="rounded-lg p-2 text-muted hover:bg-rose-light hover:text-rose" onClick={() => setToDelete(s)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit listing' : 'Add listing'} wide>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <Input label="Service title" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} options={SERVICE_CATEGORIES} />
              <Input label="City" required value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              <Input label="Price (₹)" type="number" min="0" required value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
              <Select label="Pricing unit" value={editing.priceUnit} onChange={(e) => setEditing({ ...editing, priceUnit: e.target.value })} options={UNITS} />
            </div>
            <Input label="Traditions served (comma separated)" placeholder="Hindu, Sikh, Non-religious" value={editing.traditions} onChange={(e) => setEditing({ ...editing, traditions: e.target.value })} />
            <Textarea label="Description" rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <Toggle checked={editing.isAvailable} onChange={(v) => setEditing({ ...editing, isAvailable: v })} label="Currently available" />
              <Input label="Availability note" placeholder="e.g. 24x7, Sundays closed" value={editing.availabilityNote || ''} onChange={(e) => setEditing({ ...editing, availabilityNote: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Save listing</button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Remove this listing?"
        text="Families will no longer see it. Plans that already include it keep their record."
        confirmLabel="Remove"
        danger
        onConfirm={async () => { await api.delete(`/services/${toDelete._id}`); toast('Listing removed'); setToDelete(null); load(); }}
      />
    </>
  );
}
