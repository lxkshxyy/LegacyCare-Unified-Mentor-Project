import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Send, Bell, UserCog, LogOut, Menu, X, Users, ShieldCheck, Tags, AlertTriangle, Store, Heart, Home,
} from 'lucide-react';
import { Logo } from './ui';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const MENUS = {
  planner: [
    { to: '/planner', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/planner/plans', label: 'My plans', icon: FileText },
    { to: '/planner/requests', label: 'Service requests', icon: Send },
    { to: '/providers', label: 'Browse providers', icon: Store },
  ],
  nominee: [
    { to: '/nominee', label: 'Shared with me', icon: Heart, end: true },
    { to: '/nominee/requests', label: 'Service requests', icon: Send },
  ],
  provider: [
    { to: '/provider', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/provider/listings', label: 'My listings', icon: Store },
    { to: '/provider/requests', label: 'Requests', icon: Send },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/providers', label: 'Provider verification', icon: ShieldCheck },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  ],
};

const ROLE_LABEL = { planner: 'Planner', nominee: 'Family / Nominee', provider: 'Service provider', admin: 'Administrator' };

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const base = `/${user.role}`;

  useEffect(() => {
    setOpen(false);
    api.get('/notifications').then(({ data }) => setUnread(data.unread)).catch(() => {});
  }, [location.pathname]);

  const items = [
    ...MENUS[user.role],
    { to: `${base}/notifications`, label: 'Notifications', icon: Bell, badge: unread },
    { to: `${base}/account`, label: 'Account & help', icon: UserCog },
  ];

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link to="/"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-sage text-white' : 'text-ink-soft hover:bg-sand'}`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{label}</span>
            {badge > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-white">{badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-sand">
          <Home className="h-[18px] w-[18px]" /> Public site
        </Link>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-sand"
        >
          <LogOut className="h-[18px] w-[18px]" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print hidden w-64 shrink-0 border-r border-line bg-white lg:fixed lg:inset-y-0 lg:block">{Sidebar}</aside>
      {open && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">{Sidebar}</aside>
        </div>
      )}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ivory/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden text-sm text-muted lg:block">{ROLE_LABEL[user.role]} dashboard</div>
          <div className="flex items-center gap-3">
            <Link to={`${base}/notifications`} className="relative rounded-lg p-2 hover:bg-sand" aria-label="Notifications">
              <Bell className="h-5 w-5 text-ink-soft" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />}
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light font-medium text-sage-dark">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted">{ROLE_LABEL[user.role]}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      {open && <button className="sr-only" onClick={() => setOpen(false)}><X /></button>}
    </div>
  );
}
