export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export const date = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const SERVICE_CATEGORIES = {
  'funeral-agency': 'Funeral agency',
  transport: 'Transport',
  'flowers-decoration': 'Flowers & decoration',
  'priest-pandit': 'Pandit / priest',
  'cremation-burial': 'Cremation / burial ground',
  catering: 'Catering',
  other: 'Other',
};

export const PRICE_UNITS = {
  'per-service': '/ service',
  'per-km': '/ km',
  'per-hour': '/ hour',
  'per-person': '/ person',
  package: 'package',
};

export const TRADITIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Non-religious', 'Other'];

export const OFFICIANTS = {
  pandit: 'Pandit',
  priest: 'Priest',
  clergy: 'Clergy',
  imam: 'Imam',
  granthi: 'Granthi',
  monk: 'Monk',
  celebrant: 'Celebrant (non-religious)',
  none: 'No officiant',
};

export const DISPOSITIONS = {
  cremation: 'Cremation',
  burial: 'Burial',
  'body-donation': 'Body donation',
  other: 'Other',
};

export const fileSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
