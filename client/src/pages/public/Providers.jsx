import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Phone, Mail, MapPin, BadgeCheck, Plus } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import ServiceCard from '../../components/ServiceCard';
import { EmptyState, Modal, PageLoader, Select, Badge, useToast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { inr, SERVICE_CATEGORIES, PRICE_UNITS } from '../../utils/format';

export function AddToPlanButton({ service }) {
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState('');
  if (!user || user.role !== 'planner') return null;
  const openModal = async () => {
    setOpen(true);
    const { data } = await api.get('/plans');
    setPlans(data.plans);
    setPlanId(data.plans[0]?._id || '');
  };
  const add = async () => {
    try {
      await api.post(`/plans/${planId}/services`, { serviceId: service._id });
      toast('Added to your plan');
      setOpen(false);
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };
  return (
    <>
      <button className="btn-primary px-3" onClick={openModal} aria-label="Add to plan"><Plus className="h-4 w-4" /></button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add to a plan"
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!planId} onClick={add}>Add service</button></>}
      >
        {plans.length ? (
          <Select label={`Add "${service.title}" to`} value={planId} onChange={(e) => setPlanId(e.target.value)} options={Object.fromEntries(plans.map((p) => [p._id, p.title]))} />
        ) : (
          <p className="text-ink-soft">You don't have a plan yet. <Link className="link" to="/planner/plans/new">Create one first</Link>.</p>
        )}
      </Modal>
    </>
  );
}

export function ServiceDetailModal({ service, onClose }) {
  if (!service) return null;
  const p = service.provider || {};
  return (
    <Modal open={!!service} onClose={onClose} title={service.title} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="gray">{SERVICE_CATEGORIES[service.category]}</Badge>
          {service.isAvailable ? <Badge tone="green">Available</Badge> : <Badge tone="rose">Currently unavailable</Badge>}
          {(service.traditions || []).map((t) => <Badge key={t} tone="gold">{t}</Badge>)}
        </div>
        <p className="font-serif text-3xl">{inr(service.price)} <span className="font-sans text-sm text-muted">{PRICE_UNITS[service.priceUnit]}</span></p>
        {service.description && <p className="text-ink-soft">{service.description}</p>}
        {service.availabilityNote && <p className="text-sm text-muted">Availability: {service.availabilityNote}</p>}
        <div className="rounded-xl bg-ivory p-4">
          <p className="flex items-center gap-1.5 font-medium">{p.provider?.businessName || p.name} <BadgeCheck className="h-4 w-4 text-sage" /></p>
          {p.provider?.description && <p className="mt-1 text-sm text-ink-soft">{p.provider.description}</p>}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {service.city}</span>
            {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 hover:text-sage"><Phone className="h-4 w-4" /> {p.phone}</a>}
            {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 hover:text-sage"><Mail className="h-4 w-4" /> {p.email}</a>}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Providers() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ services: [], total: 0 });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') || '');
  const [selected, setSelected] = useState(null);

  const filters = Object.fromEntries(params.entries());
  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    api.get('/services/cities').then(({ data }) => setCities(data.cities)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/services', { params: filters })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  return (
    <div className="container-page py-12">
      <p className="text-sm font-medium uppercase tracking-widest text-gold">Provider directory</p>
      <h1 className="mt-2 text-4xl">Find a verified provider</h1>
      <p className="mt-2 text-ink-soft">Every provider listed here has been checked by the LegacyCare team.</p>

      <form
        className="mt-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter('q', q.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input className="input pl-11" placeholder="Search services, e.g. hearse, pandit, flowers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn-primary">Search</button>
      </form>

      <div className="card mt-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-soft lg:col-span-1"><SlidersHorizontal className="h-4 w-4" /> Filters</div>
        <Select value={filters.category || ''} onChange={(e) => setFilter('category', e.target.value)} options={SERVICE_CATEGORIES} placeholder="All categories" aria-label="Category" />
        <Select value={filters.city || ''} onChange={(e) => setFilter('city', e.target.value)} options={Object.fromEntries(cities.map((c) => [c, c]))} placeholder="All cities" aria-label="City" />
        <Select
          value={filters.maxPrice || ''}
          onChange={(e) => setFilter('maxPrice', e.target.value)}
          options={{ 5000: 'Up to ₹5,000', 10000: 'Up to ₹10,000', 25000: 'Up to ₹25,000', 50000: 'Up to ₹50,000' }}
          placeholder="Any budget"
          aria-label="Budget"
        />
        <Select value={filters.sort || 'price'} onChange={(e) => setFilter('sort', e.target.value)} options={{ price: 'Price: low to high', '-price': 'Price: high to low', newest: 'Newest' }} aria-label="Sort" />
        <label className="flex items-center gap-2 text-sm lg:col-start-2">
          <input type="checkbox" className="h-4 w-4 accent-sage" checked={filters.available === 'true'} onChange={(e) => setFilter('available', e.target.checked ? 'true' : '')} />
          Available now only
        </label>
      </div>

      <p className="mt-6 text-sm text-muted">{loading ? 'Searching…' : `${data.total} service${data.total === 1 ? '' : 's'} found`}</p>
      {loading ? (
        <PageLoader />
      ) : data.services.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.services.map((s) => (
            <ServiceCard key={s._id} service={s} onView={setSelected} action={<AddToPlanButton service={s} />} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No providers match these filters" text="Try another city or category, or clear the filters." action={<button className="btn-secondary" onClick={() => { setQ(''); setParams({}); }}>Clear filters</button>} />
        </div>
      )}
      <ServiceDetailModal service={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
