import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, Heart, Store } from 'lucide-react';
import { useAuth, HOME_BY_ROLE } from '../../context/AuthContext';
import { errMsg } from '../../api/client';
import { Input, Spinner, Textarea } from '../../components/ui';
import { AuthShell } from './Login';

const ROLES = [
  { id: 'planner', icon: ClipboardList, title: 'Plan for myself', text: 'Record my own wishes' },
  { id: 'nominee', icon: Heart, title: "I'm a family nominee", text: 'View a plan shared with me' },
  { id: 'provider', icon: Store, title: "I'm a service provider", text: 'List my services' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(ROLES.some((r) => r.id === params.get('role')) ? params.get('role') : 'planner');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: '', businessName: '', licenseNumber: '', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setBusy(true);
    try {
      const user = await register({ ...form, role });
      navigate(user.role === 'planner' ? '/planner/plans/new' : HOME_BY_ROLE[user.role], { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="It's free, private, and you can take your time.">
      <div className="mb-6 grid grid-cols-3 gap-2">
        {ROLES.map(({ id, icon: Icon, title, text }) => (
          <button
            key={id}
            type="button"
            onClick={() => setRole(id)}
            className={`rounded-2xl border p-3 text-left transition ${role === id ? 'border-sage bg-sage-light' : 'border-line bg-white hover:bg-sand'}`}
            aria-pressed={role === id}
          >
            <Icon className={`h-5 w-5 ${role === id ? 'text-sage-dark' : 'text-muted'}`} />
            <p className="mt-2 text-sm font-medium leading-tight">{title}</p>
            <p className="mt-0.5 hidden text-xs text-muted sm:block">{text}</p>
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-xl bg-rose-light px-4 py-3 text-sm text-[#8c4f5b]">{error}</div>}
        {role === 'nominee' && (
          <p className="rounded-xl bg-gold-light px-4 py-3 text-sm text-[#8a6d2f]">Use the same email address the planner added for you, so their plan appears on your dashboard.</p>
        )}
        <Input label="Full name" required value={form.name} onChange={set('name')} autoComplete="name" />
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
        <Input label="Password" type="password" required minLength={8} hint="At least 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
          <Input label="City" value={form.city} onChange={set('city')} required={role === 'provider'} />
        </div>
        {role === 'provider' && (
          <>
            <Input label="Business name" required value={form.businessName} onChange={set('businessName')} />
            <Input label="Licence / registration number" value={form.licenseNumber} onChange={set('licenseNumber')} hint="Helps us verify you faster" />
            <Textarea label="About your business" value={form.description} onChange={set('description')} />
          </>
        )}
        <p className="text-xs text-muted">By continuing you agree to keep information accurate and respectful. Your sensitive details are encrypted.</p>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Create account</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link to="/login" className="link">Log in</Link></p>
    </AuthShell>
  );
}
