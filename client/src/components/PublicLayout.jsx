import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Lock, Mail, Phone } from 'lucide-react';
import { Logo } from './ui';
import { useAuth, HOME_BY_ROLE } from '../context/AuthContext';

const NAV = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/providers', label: 'Find a provider' },
  { to: '/faq', label: 'FAQ' },
  { to: '/register?role=provider', label: 'Become a provider' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" aria-label="LegacyCare home"><Logo /></Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'text-sage-dark' : 'text-ink-soft hover:text-ink'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <Link to={HOME_BY_ROLE[user.role]} className="btn-primary">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/register" className="btn-primary">Start your plan</Link>
              </>
            )}
          </div>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-line bg-ivory lg:hidden">
            <div className="container-page flex flex-col gap-1 py-3">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-ink-soft hover:bg-sand">
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {user ? (
                  <Link to={HOME_BY_ROLE[user.role]} onClick={() => setOpen(false)} className="btn-primary col-span-2">Go to dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary">Log in</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="btn-primary">Start your plan</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 bg-ink text-white/80">
        <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm text-white/60">
              A calm, private place to record your final wishes — so the people you love are left with clarity, not confusion.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-white/50">
              <Lock className="h-3.5 w-3.5" /> Sensitive details are encrypted. Only the people you choose can see your plan.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-sans text-sm font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/how-it-works" className="hover:text-white">How it works</Link></li>
              <li><Link to="/providers" className="hover:text-white">Find a provider</Link></li>
              <li><Link to="/register?role=provider" className="hover:text-white">Become a provider</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-sans text-sm font-semibold text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> care@legacycare.in</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-000-0000 (toll free)</li>
              <li className="text-white/50">Mon–Sat, 9 am – 7 pm IST</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} LegacyCare. Built as a Unified Mentor internship project.</span>
            <span>LegacyCare does not provide legal will drafting or medical/emergency services.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
