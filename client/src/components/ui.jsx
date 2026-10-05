import { createContext, useCallback, useContext, useEffect, useId, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Loader2, Inbox } from 'lucide-react';

/* ---------- Logo ---------- */
export function LotusMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#5B7B6A" />
      <g fill="none" stroke="#FAF7F2" strokeWidth="3" strokeLinejoin="round">
        <path d="M32 16c6 6 6 18 0 26-6-8-6-20 0-26z" />
        <path d="M32 42c-4-9-12-14-20-13 1 9 9 15 20 13z" />
        <path d="M32 42c4-9 12-14 20-13-1 9-9 15-20 13z" />
      </g>
      <path d="M18 48h28" stroke="#C8A96A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ light = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <LotusMark />
      <span className={`font-serif text-xl font-medium ${light ? 'text-white' : 'text-ink'}`}>
        Legacy<span className="text-sage">Care</span>
      </span>
    </span>
  );
}

/* ---------- Form fields ---------- */
export function Field({ label, hint, error, children, className = '', htmlFor }) {
  return (
    <div className={className}>
      {label && <label className="label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </div>
  );
}

export function Input({ label, hint, className, id, ...props }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Field label={label} hint={hint} className={className} htmlFor={fid}>
      <input id={fid} className="input" {...props} />
    </Field>
  );
}

export function Textarea({ label, hint, className, rows = 3, id, ...props }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Field label={label} hint={hint} className={className} htmlFor={fid}>
      <textarea id={fid} className="input resize-y" rows={rows} {...props} />
    </Field>
  );
}

export function Select({ label, hint, className, options, placeholder, id, ...props }) {
  const auto = useId();
  const fid = id || auto;
  return (
  <Field label={label} hint={hint} className={className} htmlFor={fid}>
    <select id={fid} className="input" {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {Object.entries(options).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  </Field>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-sage' : 'bg-line'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}

/* ---------- Display ---------- */
const BADGE = {
  green: 'bg-sage-light text-sage-dark',
  gold: 'bg-gold-light text-[#8a6d2f]',
  rose: 'bg-rose-light text-[#8c4f5b]',
  gray: 'bg-sand text-ink-soft',
  blue: 'bg-[#e8eef6] text-[#3b5a80]',
};

export const STATUS_TONE = {
  draft: 'gold', finalized: 'green', pending: 'gold', accepted: 'blue', declined: 'rose', completed: 'green',
  cancelled: 'gray', verified: 'green', rejected: 'rose', active: 'green', suspended: 'rose', open: 'rose',
  'in-review': 'gold', resolved: 'green',
};

export function Badge({ tone = 'gray', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${BADGE[tone]} ${className}`}>
      {children}
    </span>
  );
}

export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status] || 'gray'}>{status}</Badge>;

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-sage ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage-light">
        <Icon className="h-6 w-6 text-sage" />
      </div>
      <h3 className="text-lg">{title}</h3>
      {text && <p className="mt-1 max-w-md text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'sage' }) {
  const tones = { sage: 'bg-sage-light text-sage', gold: 'bg-gold-light text-gold', rose: 'bg-rose-light text-rose', blue: 'bg-[#e8eef6] text-[#3b5a80]' };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 font-serif text-3xl">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-lg">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-sand" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, text, confirmLabel = 'Confirm', danger }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try { await onConfirm(); } finally { setBusy(false); }
            }}
          >
            {busy && <Spinner className="h-4 w-4 text-white" />} {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-ink-soft">{text}</p>
    </Modal>
  );
}

/* ---------- Toasts ---------- */
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="no-print fixed bottom-4 right-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex w-full max-w-sm items-start gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg ${t.type === 'error' ? 'border-rose/40' : 'border-sage/30'}`}
          >
            {t.type === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------- Simple bar chart (no external libs) ---------- */
export function BarList({ data, color = 'bg-sage' }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <p className="text-sm text-muted">No data yet.</p>;
  return (
    <div className="space-y-3">
      {entries.map(([k, v]) => (
        <div key={k}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="capitalize text-ink-soft">{k}</span>
            <span className="font-medium tabular-nums">{v}</span>
          </div>
          <div className="h-2.5 rounded-full bg-sand">
            <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${(v / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressRing({ value = 0, size = 96 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-label={`${value}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E7E1D8" strokeWidth="8" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} stroke="#5B7B6A" strokeWidth="8" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (value / 100) * c} style={{ transition: 'stroke-dashoffset .6s' }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="rotate-90 fill-ink font-serif text-xl" style={{ transformOrigin: 'center' }}>
        {value}%
      </text>
    </svg>
  );
}
