import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { PageHeader, PageLoader, Modal, Input, Select, Textarea, Toggle, Badge, ConfirmModal, useToast } from '../../components/ui';
import { TRADITIONS } from '../../utils/format';

export default function AdminCategories() {
  const toast = useToast();
  const [cats, setCats] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const load = () => api.get('/categories', { params: { all: 1 } }).then(({ data }) => setCats(data.categories));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing._id) await api.put(`/categories/${editing._id}`, editing);
      else await api.post('/categories', editing);
      toast('Category saved');
      setEditing(null);
      load();
    } catch (err) { toast(errMsg(err), 'error'); }
  };

  if (!cats) return <PageLoader />;
  const group = (kind) => cats.filter((c) => c.kind === kind);
  return (
    <>
      <PageHeader title="Categories" subtitle="Ritual categories and service types shown to users." actions={<button className="btn-primary" onClick={() => setEditing({ name: '', kind: 'ritual', tradition: '', description: '', isActive: true })}><Plus className="h-4 w-4" /> Add category</button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        {[['ritual', 'Ritual categories'], ['service', 'Service types']].map(([kind, title]) => (
          <div key={kind} className="card">
            <h2 className="border-b border-line px-5 py-4 text-lg">{title} <span className="text-sm text-muted">({group(kind).length})</span></h2>
            <ul className="divide-y divide-line">
              {group(kind).map((c) => (
                <li key={c._id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="font-medium">{c.name} {!c.isActive && <Badge tone="gray">hidden</Badge>}</p>
                    <p className="text-xs text-muted">{[c.tradition, c.description].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="rounded-lg p-2 text-muted hover:bg-sand" onClick={() => setEditing(c)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button className="rounded-lg p-2 text-muted hover:bg-rose-light hover:text-rose" onClick={() => setToDelete(c)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit category' : 'Add category'}>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <Input label="Name" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Kind" value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })} options={{ ritual: 'Ritual', service: 'Service type' }} />
              <Select label="Tradition" value={editing.tradition || ''} onChange={(e) => setEditing({ ...editing, tradition: e.target.value })} options={Object.fromEntries(TRADITIONS.map((t) => [t, t]))} placeholder="—" />
            </div>
            <Textarea label="Description" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <Toggle checked={editing.isActive} onChange={(v) => setEditing({ ...editing, isActive: v })} label="Visible to users" />
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmModal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete category?" text={`"${toDelete?.name}" will be removed. Consider hiding it instead if plans already use it.`} confirmLabel="Delete" danger
        onConfirm={async () => { await api.delete(`/categories/${toDelete._id}`); toast('Category deleted'); setToDelete(null); load(); }} />
    </>
  );
}
