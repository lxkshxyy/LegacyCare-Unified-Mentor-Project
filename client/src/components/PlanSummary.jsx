import { MapPin, Flower2, BookOpen, Music, Store, Users, FileText, Lock, Phone, Mail, Download, BadgeCheck } from 'lucide-react';
import { Badge, StatusBadge } from './ui';
import { downloadFile } from '../api/client';
import { inr, date, fileSize, DISPOSITIONS, OFFICIANTS, SERVICE_CATEGORIES, PRICE_UNITS } from '../utils/format';

function Section({ icon: Icon, title, children, action }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light"><Icon className="h-4 w-4 text-sage" /></span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 border-b border-line/70 py-2.5 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="whitespace-pre-line">{value}</dd>
    </div>
  );
}

const Empty = ({ children }) => <p className="text-sm text-muted">{children}</p>;

export default function PlanSummary({ plan, documents = [], renderServiceAction, showNomineeDetails = true }) {
  const c = plan.ceremony || {};
  const hasCeremony = Object.values(c).some(Boolean) || plan.personalNotes;
  return (
    <div className="space-y-5">
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl">{plan.title}</h1>
            <StatusBadge status={plan.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {plan.owner?.name && <>Plan of <span className="text-ink">{plan.owner.name}</span> · </>}
            Last updated {date(plan.updatedAt)} · Version {plan.version}
            {plan.finalizedAt && <> · Finalized {date(plan.finalizedAt)}</>}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted">Estimated budget</p>
          <p className="font-serif text-3xl">{inr(plan.budget?.estimate)}</p>
          {plan.budget?.limit > 0 && <p className="text-xs text-muted">Comfortable limit {inr(plan.budget.limit)}</p>}
        </div>
      </div>

      <Section icon={MapPin} title="Location & arrangement">
        {plan.location?.city || plan.disposition ? (
          <dl>
            <Row label="Preferred venue" value={plan.location?.venue} />
            <Row label="City / State" value={[plan.location?.city, plan.location?.state].filter(Boolean).join(', ')} />
            <Row label="Arrangement" value={DISPOSITIONS[plan.disposition]} />
            <Row label="Location notes" value={plan.location?.notes} />
          </dl>
        ) : <Empty>Not added yet.</Empty>}
      </Section>

      <Section icon={Flower2} title="Rituals">
        {plan.ritual?.type ? (
          <dl>
            <Row label="Ceremony type" value={plan.ritual.type === 'religious' ? 'Religious' : 'Non-religious'} />
            <Row label="Tradition" value={plan.ritual.tradition} />
            <Row label="Ritual" value={plan.ritual.category?.name} />
            <Row label="Details" value={plan.ritual.details} />
          </dl>
        ) : <Empty>Not added yet.</Empty>}
      </Section>

      <Section icon={BookOpen} title="Officiant">
        {plan.officiant?.preference ? (
          <dl>
            <Row label="Preference" value={OFFICIANTS[plan.officiant.preference]} />
            <Row label="Name" value={plan.officiant.name} />
            <Row label="Contact" value={plan.officiant.contact} />
            <Row label="Notes" value={plan.officiant.notes} />
          </dl>
        ) : <Empty>Not added yet.</Empty>}
      </Section>

      <Section icon={Music} title="Ceremony instructions" action={<Badge tone="green"><Lock className="h-3 w-3" /> Encrypted</Badge>}>
        {hasCeremony ? (
          <dl>
            <Row label="Music" value={c.music} />
            <Row label="Prayers / readings" value={c.prayers} />
            <Row label="Customs" value={c.customs} />
            <Row label="Dress code" value={c.dressCode} />
            <Row label="Other instructions" value={c.otherInstructions} />
            <Row label="Personal note" value={plan.personalNotes} />
          </dl>
        ) : <Empty>Not added yet.</Empty>}
      </Section>

      <Section icon={Store} title={`Selected services (${plan.selectedServices?.length || 0})`}>
        {plan.selectedServices?.length ? (
          <ul className="divide-y divide-line">
            {plan.selectedServices.map((s) => {
              const p = s.provider || {};
              return (
                <li key={s._id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{s.service?.title || 'Service removed'}</p>
                    <p className="flex items-center gap-1 text-sm text-muted">
                      {SERVICE_CATEGORIES[s.service?.category]} · {p.provider?.businessName || p.name}
                      {p.provider?.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 text-sage" />}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                      {p.phone && <a className="flex items-center gap-1 text-sage-dark" href={`tel:${p.phone}`}><Phone className="h-3.5 w-3.5" /> {p.phone}</a>}
                      {p.email && <a className="flex items-center gap-1 text-sage-dark" href={`mailto:${p.email}`}><Mail className="h-3.5 w-3.5" /> {p.email}</a>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-serif text-lg">{inr(s.priceAtSelection)} <span className="font-sans text-xs text-muted">{PRICE_UNITS[s.service?.priceUnit]}</span></p>
                    {renderServiceAction && renderServiceAction(s)}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <Empty>No services selected yet.</Empty>}
      </Section>

      <Section icon={Users} title="Nominees">
        {plan.nominees?.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {plan.nominees.map((n) => (
              <li key={n.email} className="rounded-xl bg-ivory p-4">
                <p className="font-medium">{n.name} {n.relation && <span className="text-sm font-normal text-muted">· {n.relation}</span>}</p>
                <p className="text-sm text-muted">{n.email}</p>
                {showNomineeDetails && n.phone && <p className="text-sm text-muted">{n.phone}</p>}
                {showNomineeDetails && n.accessGranted !== undefined && (
                  <Badge tone={n.accessGranted ? 'green' : 'gray'} className="mt-2">{n.accessGranted ? 'Access on' : 'Access off'}</Badge>
                )}
              </li>
            ))}
          </ul>
        ) : <Empty>No nominees added yet.</Empty>}
      </Section>

      <Section icon={FileText} title={`Documents (${documents.length})`}>
        {documents.length ? (
          <ul className="divide-y divide-line">
            {documents.map((d) => (
              <li key={d._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.label}</p>
                  <p className="truncate text-xs text-muted">{d.originalName} · {fileSize(d.size)} · {date(d.createdAt)}</p>
                </div>
                <button className="btn-secondary no-print px-3" onClick={() => downloadFile(`/documents/${d._id}/download`, d.originalName)}>
                  <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <Empty>No documents uploaded.</Empty>}
      </Section>
    </div>
  );
}
