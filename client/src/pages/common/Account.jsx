import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Input, Textarea, Select, StatusBadge, Spinner, useToast } from '../../components/ui';
import { date } from '../../utils/format';

export default function Account() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({
    name: user.name, phone: user.phone || '', city: user.city || '',
    provider: { businessName: user.provider?.businessName || '', licenseNumber: user.provider?.licenseNumber || '', description: user.provider?.description || '', serviceAreas: (user.provider?.serviceAreas || []).join(', ') },
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [dispute, setDispute] = useState({ subject: '', message: '', priority: 'medium' });
  const [disputes, setDisputes] = useState([]);
  const [busy, setBusy] = useState('');

  useEffect(() => { api.get('/disputes/mine').then(({ data }) => setDisputes(data.disputes)); }, []);

  const run = async (key, fn, msg) => {
    setBusy(key);
    try { await fn(); toast(msg); } catch (e) { toast(errMsg(e), 'error'); } finally { setBusy(''); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Account & help" subtitle={`Member since ${date(user.createdAt)}`} />

      <form className="card space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); run('profile', async () => { const { data } = await api.put('/auth/me', profile); setUser(data.user); }, 'Profile updated'); }}>
        <h2 className="text-lg">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Email" value={user.email} disabled hint="Contact support to change your email" />
          <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <Input label="City" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
        </div>
        {user.role === 'provider' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Business name" value={profile.provider.businessName} onChange={(e) => setProfile({ ...profile, provider: { ...profile.provider, businessName: e.target.value } })} />
            <Input label="Licence number" value={profile.provider.licenseNumber} onChange={(e) => setProfile({ ...profile, provider: { ...profile.provider, licenseNumber: e.target.value } })} />
            <Input className="sm:col-span-2" label="Service areas (comma separated)" value={profile.provider.serviceAreas} onChange={(e) => setProfile({ ...profile, provider: { ...profile.provider, serviceAreas: e.target.value } })} />
            <Textarea className="sm:col-span-2" label="About your business" value={profile.provider.description} onChange={(e) => setProfile({ ...profile, provider: { ...profile.provider, description: e.target.value } })} />
          </div>
        )}
        <button className="btn-primary" disabled={busy === 'profile'}>{busy === 'profile' && <Spinner className="h-4 w-4 text-white" />} Save profile</button>
      </form>

      <form className="card space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); run('pw', async () => { await api.put('/auth/password', pw); setPw({ currentPassword: '', newPassword: '' }); }, 'Password changed'); }}>
        <h2 className="text-lg">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Current password" type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" />
          <Input label="New password" type="password" required minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" />
        </div>
        <button className="btn-secondary" disabled={busy === 'pw'}>Update password</button>
      </form>

      {user.role !== 'admin' && (
        <>
          <form className="card space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); if (!rating) return toast('Please choose a rating', 'error'); run('fb', async () => { await api.post('/feedback', { rating, comment }); setRating(0); setComment(''); }, 'Thank you for your feedback'); }}>
            <h2 className="text-lg">How is LegacyCare working for you?</h2>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star`} className="p-1">
                  <Star className={`h-7 w-7 ${n <= rating ? 'fill-gold text-gold' : 'text-line'}`} />
                </button>
              ))}
            </div>
            <Textarea label="Comments (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-secondary" disabled={busy === 'fb'}>Send feedback</button>
          </form>

          <form className="card space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); run('d', async () => { const { data } = await api.post('/disputes', dispute); setDisputes([data.dispute, ...disputes]); setDispute({ subject: '', message: '', priority: 'medium' }); }, 'Your issue has been raised with our team'); }}>
            <h2 className="text-lg">Raise an issue</h2>
            <p className="-mt-2 text-sm text-muted">Problems with a provider, a request, or the platform. Our team will respond.</p>
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <Input label="Subject" required value={dispute.subject} onChange={(e) => setDispute({ ...dispute, subject: e.target.value })} />
              <Select label="Priority" value={dispute.priority} onChange={(e) => setDispute({ ...dispute, priority: e.target.value })} options={{ low: 'Low', medium: 'Medium', high: 'High' }} />
            </div>
            <Textarea label="Describe the issue" required value={dispute.message} onChange={(e) => setDispute({ ...dispute, message: e.target.value })} />
            <button className="btn-secondary" disabled={busy === 'd'}>Submit</button>
            {disputes.length > 0 && (
              <ul className="divide-y divide-line border-t border-line pt-2">
                {disputes.map((d) => (
                  <li key={d._id} className="flex items-start justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{d.subject}</p>
                      {d.resolution && <p className="text-muted">Resolution: {d.resolution}</p>}
                      <p className="text-xs text-muted">{date(d.createdAt)}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </li>
                ))}
              </ul>
            )}
          </form>
        </>
      )}
    </div>
  );
}
