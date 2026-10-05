import { useEffect, useState } from 'react';
import { Search, BadgeCheck } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { PageHeader, PageLoader, Select, StatusBadge, Badge, useToast } from '../../components/ui';
import { date } from '../../utils/format';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const load = () => api.get('/admin/users', { params: { role: role || undefined, q: q || undefined } }).then(({ data }) => setUsers(data.users));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [role, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = async (u, body, msg) => {
    try { await api.patch(`/admin/users/${u._id}`, body); toast(msg); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Verify identities and manage account status." />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search name, email or business" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} options={{ planner: 'Planners', nominee: 'Nominees', provider: 'Providers', admin: 'Admins' }} placeholder="All roles" aria-label="Role" />
      </div>
      {!users ? <PageLoader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-5 py-3">
                    <p className="flex items-center gap-1 font-medium">{u.name} {u.isVerified && <BadgeCheck className="h-4 w-4 text-sage" aria-label="Verified" />}</p>
                    <p className="text-xs text-muted">{u.email}{u.provider?.businessName && ` · ${u.provider.businessName}`}</p>
                  </td>
                  <td className="px-5 py-3"><Badge tone={u.role === 'admin' ? 'blue' : 'gray'}>{u.role}</Badge></td>
                  <td className="px-5 py-3">{u.city || '—'}</td>
                  <td className="px-5 py-3">{date(u.createdAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {u.role !== 'admin' && (
                        <>
                          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => patch(u, { isVerified: !u.isVerified }, u.isVerified ? 'Verification removed' : 'User verified')}>
                            {u.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          <button className={`btn px-3 py-1.5 text-xs ${u.status === 'active' ? 'bg-rose-light text-[#8c4f5b]' : 'bg-sage-light text-sage-dark'}`} onClick={() => patch(u, { status: u.status === 'active' ? 'suspended' : 'active' }, u.status === 'active' ? 'User suspended' : 'User reactivated')}>
                            {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <p className="p-6 text-center text-sm text-muted">No users found.</p>}
        </div>
      )}
    </>
  );
}
