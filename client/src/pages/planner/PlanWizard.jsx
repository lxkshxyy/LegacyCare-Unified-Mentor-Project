import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Lock, Trash2, Upload, Plus, Search, FileText, ShieldCheck, Wallet } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { Input, Select, Textarea, Toggle, PageLoader, Badge, Spinner, useToast } from '../../components/ui';
import ServiceCard from '../../components/ServiceCard';
import { ServiceDetailModal } from '../public/Providers';
import { inr, fileSize, DISPOSITIONS, OFFICIANTS, SERVICE_CATEGORIES, TRADITIONS, PRICE_UNITS } from '../../utils/format';

const STEPS = ['Basics', 'Rituals', 'Officiant', 'Ceremony', 'Services', 'Nominees', 'Documents', 'Review'];

const toForm = (p = {}) => ({
  title: p.title || 'My Funeral Plan',
  disposition: p.disposition || '',
  personalNotes: p.personalNotes || '',
  location: { venue: '', city: '', state: '', notes: '', ...(p.location || {}) },
  ritual: { type: '', tradition: '', details: '', ...(p.ritual || {}), category: p.ritual?.category?._id || p.ritual?.category || '' },
  officiant: { preference: '', name: '', contact: '', notes: '', ...(p.officiant || {}) },
  ceremony: { music: '', prayers: '', customs: '', dressCode: '', otherInstructions: '', ...(p.ceremony || {}) },
  budget: { limit: p.budget?.limit || '' },
});

function Stepper({ step, setStep, enabled }) {
  return (
    <ol className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={s} className="shrink-0">
            <button
              type="button"
              disabled={!enabled && i > 0}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${active ? 'bg-sage text-white' : done ? 'bg-sage-light text-sage-dark' : 'text-muted hover:bg-sand'} disabled:opacity-50`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${active ? 'bg-white/20' : done ? 'bg-sage text-white' : 'bg-line text-ink-soft'}`}>
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function PlanWizard() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const step = Math.min(Number(params.get('step') || 0), STEPS.length - 1);
  const setStep = (s) => setParams({ step: String(s) }, { replace: true });

  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState(toForm());
  const [documents, setDocuments] = useState([]);
  const [ritualCats, setRitualCats] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories', { params: { kind: 'ritual' } }).then(({ data }) => setRitualCats(data.categories));
  }, []);

  useEffect(() => {
    if (isNew) return;
    api.get(`/plans/${id}`).then(({ data }) => {
      setPlan(data.plan);
      setForm(toForm(data.plan));
      setDocuments(data.documents);
      setLoading(false);
    }).catch((e) => { toast(errMsg(e), 'error'); navigate('/planner/plans'); });
  }, [id, isNew, navigate, toast]);

  const set = (group, key) => (e) => {
    const v = e?.target ? e.target.value : e;
    setForm((f) => (key ? { ...f, [group]: { ...f[group], [key]: v } } : { ...f, [group]: v }));
  };

  const saveFields = async (summary) => {
    const payload = { ...form, budget: { limit: form.budget.limit === '' ? undefined : Number(form.budget.limit) }, summary };
    if (isNew) {
      const { data } = await api.post('/plans', payload);
      return data.plan;
    }
    const { data } = await api.put(`/plans/${id}`, payload);
    return data.plan;
  };

  const next = async () => {
    setSaving(true);
    try {
      if (step <= 3) {
        const saved = await saveFields(`Updated ${STEPS[step].toLowerCase()}`);
        if (isNew) {
          toast('Draft saved. Let\'s continue.');
          navigate(`/planner/plans/${saved._id}/edit?step=1`, { replace: true });
          return;
        }
        setPlan(saved);
      }
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const saved = await saveFields('Saved draft');
      toast('Saved');
      if (isNew) navigate(`/planner/plans/${saved._id}/edit?step=0`, { replace: true });
      else setPlan(saved);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const ritualOptions = Object.fromEntries(
    ritualCats.filter((c) => !form.ritual.tradition || c.tradition === form.ritual.tradition).map((c) => [c._id, `${c.name}${c.tradition ? ` (${c.tradition})` : ''}`])
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/planner/plans" className="text-sm text-muted hover:text-ink">← My plans</Link>
          <h1 className="mt-1 text-2xl sm:text-3xl">{isNew ? 'Start your plan' : form.title}</h1>
        </div>
        {plan && <Badge tone={plan.status === 'finalized' ? 'green' : 'gold'}>{plan.status}</Badge>}
      </div>
      <Stepper step={step} setStep={setStep} enabled={!isNew} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="card p-5 sm:p-7">
          {step === 0 && (
            <div className="space-y-5">
              <StepIntro title="The basics" text="Where would you like your last rites to take place, and how?" />
              <Input label="Plan name" value={form.title} onChange={set('title')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Preferred venue / place" placeholder="e.g. Nigambodh Ghat, family home, church" value={form.location.venue} onChange={set('location', 'venue')} />
                <Input label="City" required placeholder="e.g. New Delhi" value={form.location.city} onChange={set('location', 'city')} />
                <Input label="State" value={form.location.state} onChange={set('location', 'state')} />
                <Select label="Arrangement" value={form.disposition} onChange={set('disposition')} options={DISPOSITIONS} placeholder="Choose…" />
              </div>
              <Textarea label="Notes about the location" placeholder="e.g. Electric crematorium is fine if wood is not available" value={form.location.notes} onChange={set('location', 'notes')} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <StepIntro title="Ritual preferences" text="Choose the tradition you would like to be honoured." />
              <div className="grid grid-cols-2 gap-3">
                {[['religious', 'Religious', 'Following a faith tradition'], ['non-religious', 'Non-religious', 'A secular celebration of life']].map(([v, l, d]) => (
                  <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, ritual: { ...f.ritual, type: v, tradition: v === 'non-religious' ? 'Non-religious' : f.ritual.tradition === 'Non-religious' ? '' : f.ritual.tradition } }))}
                    className={`rounded-2xl border p-4 text-left transition ${form.ritual.type === v ? 'border-sage bg-sage-light' : 'border-line hover:bg-sand'}`}>
                    <p className="font-medium">{l}</p>
                    <p className="text-sm text-muted">{d}</p>
                  </button>
                ))}
              </div>
              {form.ritual.type === 'religious' && (
                <Select label="Tradition" value={form.ritual.tradition} onChange={(e) => setForm((f) => ({ ...f, ritual: { ...f.ritual, tradition: e.target.value, category: '' } }))} options={Object.fromEntries(TRADITIONS.filter((t) => t !== 'Non-religious').map((t) => [t, t]))} placeholder="Choose…" />
              )}
              {form.ritual.type && (
                <Select label="Ritual" value={form.ritual.category} onChange={set('ritual', 'category')} options={ritualOptions} placeholder="Choose (optional)…" hint="Ritual categories are curated by our team." />
              )}
              <Textarea label="Anything specific about the rituals?" value={form.ritual.details} onChange={set('ritual', 'details')} placeholder="e.g. Keep the rites simple and short" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepIntro title="Officiant" text="Who would you like to lead the ceremony?" />
              <Select label="Preference" value={form.officiant.preference} onChange={set('officiant', 'preference')} options={OFFICIANTS} placeholder="Choose…" />
              {form.officiant.preference && form.officiant.preference !== 'none' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Name (if you have someone in mind)" value={form.officiant.name} onChange={set('officiant', 'name')} />
                  <Input label="Contact" value={form.officiant.contact} onChange={set('officiant', 'contact')} />
                </div>
              )}
              <Textarea label="Notes" value={form.officiant.notes} onChange={set('officiant', 'notes')} placeholder="e.g. Our family pandit from Lucknow" />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <StepIntro title="Ceremony instructions" text="The small things that make it yours. Everything on this step is encrypted." icon={<Badge tone="green"><Lock className="h-3 w-3" /> Encrypted</Badge>} />
              <Textarea label="Music" value={form.ceremony.music} onChange={set('ceremony', 'music')} placeholder="Songs, bhajans, hymns…" />
              <Textarea label="Prayers / readings" value={form.ceremony.prayers} onChange={set('ceremony', 'prayers')} />
              <Textarea label="Customs to follow (or avoid)" value={form.ceremony.customs} onChange={set('ceremony', 'customs')} />
              <Input label="Dress code" value={form.ceremony.dressCode} onChange={set('ceremony', 'dressCode')} placeholder="e.g. White or light colours" />
              <Textarea label="Other instructions" value={form.ceremony.otherInstructions} onChange={set('ceremony', 'otherInstructions')} placeholder="e.g. Eye donation, people to inform" />
              <Textarea label="A personal note to your family" rows={4} value={form.personalNotes} onChange={set('personalNotes')} />
            </div>
          )}

          {step === 4 && <ServicesStep plan={plan} setPlan={setPlan} form={form} setForm={setForm} />}
          {step === 5 && <NomineesStep plan={plan} setPlan={setPlan} />}
          {step === 6 && <DocumentsStep plan={plan} documents={documents} setDocuments={setDocuments} />}
          {step === 7 && <ReviewStep plan={plan} setPlan={setPlan} documents={documents} setStep={setStep} />}

          {step < 7 && (
            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-between">
              <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft className="h-4 w-4" /> Back</button>
              <div className="flex flex-col gap-2 sm:flex-row">
                {step <= 3 && <button className="btn-secondary" onClick={saveDraft} disabled={saving}>Save draft</button>}
                <button className="btn-primary" onClick={next} disabled={saving}>
                  {saving && <Spinner className="h-4 w-4 text-white" />} {step <= 3 ? 'Save & continue' : 'Continue'} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-sm text-muted">Estimated budget</p>
            <p className="font-serif text-3xl">{inr(plan?.budget?.estimate)}</p>
            <p className="mt-1 text-xs text-muted">{plan?.selectedServices?.length || 0} service{plan?.selectedServices?.length === 1 ? '' : 's'} selected</p>
            {plan?.budget?.limit > 0 && (
              <>
                <div className="mt-3 h-2 rounded-full bg-sand">
                  <div className={`h-2 rounded-full ${plan.budget.estimate > plan.budget.limit ? 'bg-rose' : 'bg-sage'}`} style={{ width: `${Math.min(100, (plan.budget.estimate / plan.budget.limit) * 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted">of your {inr(plan.budget.limit)} limit</p>
              </>
            )}
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Completion</p>
            <p className="font-serif text-3xl">{plan?.completion || 0}%</p>
            <div className="mt-2 h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-sage" style={{ width: `${plan?.completion || 0}%` }} /></div>
          </div>
          <div className="rounded-2xl bg-sage-light p-5 text-sm text-sage-dark">
            <ShieldCheck className="mb-2 h-5 w-5" />
            Your plan stays private. Nominees can only see it after you finalize it, and only while their access is on.
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepIntro({ title, text, icon }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl">{title}</h2>
        {icon}
      </div>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}

/* ---------------- Step 5: Services ---------------- */
function ServicesStep({ plan, setPlan, form, setForm }) {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ category: '', city: plan.location?.city || '', q: '' });
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [limit, setLimit] = useState(form.budget.limit || '');

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/services', { params: { ...filters, limit: 30 } }).then(({ data }) => setServices(data.services));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const selectedIds = useMemo(() => new Set(plan.selectedServices.map((s) => s.service?._id)), [plan]);

  const add = async (s) => {
    setBusy(true);
    try {
      const { data } = await api.post(`/plans/${plan._id}/services`, { serviceId: s._id });
      setPlan(data.plan);
      toast(`Added "${s.title}"`);
    } catch (e) { toast(errMsg(e), 'error'); } finally { setBusy(false); }
  };
  const remove = async (itemId) => {
    try {
      const { data } = await api.delete(`/plans/${plan._id}/services/${itemId}`);
      setPlan(data.plan);
    } catch (e) { toast(errMsg(e), 'error'); }
  };
  const saveLimit = async () => {
    try {
      const { data } = await api.put(`/plans/${plan._id}`, { budget: { limit: limit === '' ? undefined : Number(limit) }, summary: 'Updated budget' });
      setPlan(data.plan);
      setForm((f) => ({ ...f, budget: { limit } }));
      toast('Budget limit saved');
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <div className="space-y-6">
      <StepIntro title="Services & budget" text="Choose verified providers. Prices are saved at the time you select them." />

      <div className="flex flex-col gap-2 rounded-2xl bg-ivory p-4 sm:flex-row sm:items-end">
        <Input className="flex-1" label="Comfortable budget limit (₹, optional)" type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <button className="btn-secondary" onClick={saveLimit}><Wallet className="h-4 w-4" /> Save limit</button>
      </div>

      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted">In your plan</h3>
        {plan.selectedServices.length ? (
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {plan.selectedServices.map((s) => (
              <li key={s._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.service?.title}</p>
                  <p className="truncate text-xs text-muted">{SERVICE_CATEGORIES[s.service?.category]} · {s.provider?.provider?.businessName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap font-medium">{inr(s.priceAtSelection)} <span className="text-xs text-muted">{PRICE_UNITS[s.service?.priceUnit]}</span></span>
                  <button className="rounded-lg p-2 text-muted hover:bg-rose-light hover:text-rose" onClick={() => remove(s._id)} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
            <li className="flex justify-between bg-ivory px-4 py-3 font-medium"><span>Estimated total</span><span>{inr(plan.budget.estimate)}</span></li>
          </ul>
        ) : <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">No services yet. Add some from below — or skip this step.</p>}
      </div>

      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted">Browse verified providers</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          </div>
          <Select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} options={SERVICE_CATEGORIES} placeholder="All categories" aria-label="Category" />
          <input className="input" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} aria-label="City" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <ServiceCard
              key={s._id}
              service={s}
              onView={setViewing}
              action={selectedIds.has(s._id)
                ? <span className="btn bg-sage-light px-3 text-sage-dark"><Check className="h-4 w-4" /></span>
                : <button className="btn-primary px-3" disabled={busy} onClick={() => add(s)}><Plus className="h-4 w-4" /> Add</button>}
            />
          ))}
          {!services.length && <p className="text-sm text-muted md:col-span-2">No providers match. Try clearing the city filter.</p>}
        </div>
      </div>
      <ServiceDetailModal service={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

/* ---------------- Step 6: Nominees ---------------- */
function NomineesStep({ plan, setPlan }) {
  const toast = useToast();
  const blank = { name: '', email: '', relation: '', phone: '' };
  const [n, setN] = useState(blank);
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post(`/plans/${plan._id}/nominees`, n);
      setPlan(data.plan);
      setN(blank);
      toast('Nominee added');
    } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };
  const toggle = async (nom) => {
    const { data } = await api.patch(`/plans/${plan._id}/nominees/${nom._id}`, { accessGranted: !nom.accessGranted });
    setPlan(data.plan);
  };
  const remove = async (nom) => {
    const { data } = await api.delete(`/plans/${plan._id}/nominees/${nom._id}`);
    setPlan(data.plan);
  };

  return (
    <div className="space-y-6">
      <StepIntro title="Nominees" text="Who should carry out your wishes? They will log in with this email to see your finalized plan." />
      {plan.nominees.length > 0 && (
        <ul className="space-y-3">
          {plan.nominees.map((nom) => (
            <li key={nom._id} className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{nom.name} {nom.relation && <span className="font-normal text-muted">· {nom.relation}</span>}</p>
                <p className="text-sm text-muted">{nom.email}{nom.phone && ` · ${nom.phone}`}</p>
              </div>
              <div className="flex items-center gap-3">
                <Toggle checked={nom.accessGranted} onChange={() => toggle(nom)} label={nom.accessGranted ? 'Access on' : 'Access off'} />
                <button className="rounded-lg p-2 text-muted hover:bg-rose-light hover:text-rose" onClick={() => remove(nom)} aria-label="Remove nominee"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="rounded-2xl bg-ivory p-4 sm:p-5">
        <h3 className="mb-3 font-sans font-semibold">Add a nominee</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Full name" required value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} />
          <Input label="Email" type="email" required value={n.email} onChange={(e) => setN({ ...n, email: e.target.value })} />
          <Input label="Relation" placeholder="e.g. Daughter, Brother, Friend" value={n.relation} onChange={(e) => setN({ ...n, relation: e.target.value })} />
          <Input label="Phone" type="tel" hint="Stored encrypted" value={n.phone} onChange={(e) => setN({ ...n, phone: e.target.value })} />
        </div>
        <button className="btn-primary mt-4" disabled={busy}><Plus className="h-4 w-4" /> Add nominee</button>
      </form>
    </div>
  );
}

/* ---------------- Step 7: Documents ---------------- */
function DocumentsStep({ plan, documents, setDocuments }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('label', label || file.name);
    setBusy(true);
    try {
      const { data } = await api.post(`/plans/${plan._id}/documents`, fd);
      setDocuments([data.document, ...documents]);
      setFile(null);
      setLabel('');
      toast('Document uploaded');
    } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };
  const remove = async (d) => {
    await api.delete(`/documents/${d._id}`);
    setDocuments(documents.filter((x) => x._id !== d._id));
  };

  return (
    <div className="space-y-6">
      <StepIntro title="Documents & notes" text="Pledge cards, ID copies, letters to loved ones. PDF, JPG, PNG, DOC or TXT up to 5 MB." />
      <form onSubmit={upload} className="space-y-3">
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]); }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${drag ? 'border-sage bg-sage-light' : 'border-line hover:bg-ivory'}`}
        >
          <Upload className="h-7 w-7 text-sage" />
          <p className="mt-2 font-medium">{file ? file.name : 'Drag a file here, or click to choose'}</p>
          <p className="text-xs text-muted">{file ? fileSize(file.size) : 'Max 5 MB'}</p>
          <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="input flex-1" placeholder="Label, e.g. Eye donation pledge card" value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Document label" />
          <button className="btn-primary" disabled={!file || busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Upload</button>
        </div>
      </form>
      {documents.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {documents.map((d) => (
            <li key={d._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-sage" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.label}</p>
                  <p className="truncate text-xs text-muted">{d.originalName} · {fileSize(d.size)}</p>
                </div>
              </div>
              <button className="rounded-lg p-2 text-muted hover:bg-rose-light hover:text-rose" onClick={() => remove(d)} aria-label="Delete document"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Step 8: Review ---------------- */
function ReviewStep({ plan, setPlan, documents, setStep }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const checks = [
    ['Location & city', !!plan.location?.city, 0],
    ['Arrangement', !!plan.disposition, 0],
    ['Ritual type', !!plan.ritual?.type, 1],
    ['Officiant', !!plan.officiant?.preference, 2],
    ['Ceremony instructions', !!(plan.ceremony?.customs || plan.ceremony?.prayers || plan.ceremony?.otherInstructions), 3],
    ['At least one service', plan.selectedServices.length > 0, 4],
    ['At least one nominee', plan.nominees.length > 0, 5],
    ['Documents (optional)', documents.length > 0, 6],
  ];
  const finalize = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/plans/${plan._id}/finalize`);
      setPlan(data.plan);
      toast('Your plan is finalized and securely saved.');
      navigate(`/planner/plans/${plan._id}`);
    } catch (e) { toast(errMsg(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-6">
      <StepIntro title="Review & finalize" text="When you finalize, your nominees are notified and can view the plan. You can still edit it any time." />
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {checks.map(([label, ok, s]) => (
          <li key={label} className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${ok ? 'bg-sage text-white' : 'bg-sand text-muted'}`}>{ok ? <Check className="h-3.5 w-3.5" /> : '–'}</span>
              {label}
            </span>
            {!ok && <button className="link text-sm" onClick={() => setStep(s)}>Add</button>}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <button className="btn-ghost" onClick={() => setStep(6)}><ChevronLeft className="h-4 w-4" /> Back</button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={`/planner/plans/${plan._id}`} className="btn-secondary">Preview plan</Link>
          {plan.status === 'finalized' ? (
            <Link to={`/planner/plans/${plan._id}`} className="btn-primary"><Check className="h-4 w-4" /> Done</Link>
          ) : (
            <button className="btn-primary" onClick={finalize} disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Finalize & share with nominees</button>
          )}
        </div>
      </div>
    </div>
  );
}
