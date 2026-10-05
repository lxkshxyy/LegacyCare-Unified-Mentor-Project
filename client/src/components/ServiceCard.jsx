import { MapPin, BadgeCheck, Building2, Truck, Flower2, Flame, UtensilsCrossed, BookOpen, Package } from 'lucide-react';
import { Badge } from './ui';
import { inr, SERVICE_CATEGORIES, PRICE_UNITS } from '../utils/format';

export const CATEGORY_ICON = {
  'funeral-agency': Building2,
  transport: Truck,
  'flowers-decoration': Flower2,
  'priest-pandit': BookOpen,
  'cremation-burial': Flame,
  catering: UtensilsCrossed,
  other: Package,
};

export default function ServiceCard({ service, onView, action }) {
  const Icon = CATEGORY_ICON[service.category] || Package;
  const p = service.provider || {};
  return (
    <div className="card flex flex-col p-5 transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light">
          <Icon className="h-5 w-5 text-sage" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-[15px] font-semibold leading-snug">{service.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
            {p.provider?.businessName || p.name}
            {p.provider?.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 shrink-0 text-sage" aria-label="Verified" />}
          </p>
        </div>
      </div>
      {service.description && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{service.description}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="gray">{SERVICE_CATEGORIES[service.category]}</Badge>
        {service.isAvailable ? <Badge tone="green">Available</Badge> : <Badge tone="rose">Unavailable</Badge>}
        {(service.traditions || []).slice(0, 2).map((t) => <Badge key={t} tone="gold">{t}</Badge>)}
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div>
          <p className="flex items-center gap-1 text-xs text-muted"><MapPin className="h-3.5 w-3.5" /> {service.city}</p>
          <p className="font-serif text-xl">
            {inr(service.price)} <span className="font-sans text-xs text-muted">{PRICE_UNITS[service.priceUnit]}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {onView && <button className="btn-secondary px-3" onClick={() => onView(service)}>Details</button>}
          {action}
        </div>
      </div>
    </div>
  );
}
