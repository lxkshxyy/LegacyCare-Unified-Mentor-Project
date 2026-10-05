import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, HOME_BY_ROLE } from '../../context/AuthContext';
import { errMsg } from '../../api/client';
import { Input, Spinner, LotusMark } from '../../components/ui';

const DEMO = [
  ['Planner', 'ramesh@example.com', 'Planner@1234'],
  ['Nominee', 'priya@example.com', 'Nominee@1234'],
  ['Provider', 'shanti@example.com', 'Provider@1234'],
  ['Admin', 'admin@legacycare.in', 'Admin@1234'],
];

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="rounded-3xl bg-sage p-10 text-white">
          <LotusMark className="h-12 w-12" />
          <h2 className="mt-6 text-3xl text-white">“The greatest gift you can give your family is clarity.”</h2>
          <p className="mt-4 text-white/80">Plan your last rites calmly, honour your traditions, and let your loved ones focus on remembering you.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(params.get('expired') ? 'Your session expired. Please log in again.' : '');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(params.get('next') || HOME_BY_ROLE[user.role], { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue to your dashboard.">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-xl bg-rose-light px-4 py-3 text-sm text-[#8c4f5b]">{error}</div>}
        <Input label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Log in</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">New to LegacyCare? <Link to="/register" className="link">Create an account</Link></p>
      <div className="card mt-8 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Demo accounts (after running the seed)</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO.map(([r, e, p]) => (
            <button key={r} type="button" className="btn-secondary justify-start text-left text-xs" onClick={() => setForm({ email: e, password: p })}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
