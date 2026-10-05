import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, MapPin } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, PageLoader, EmptyState } from '../../components/ui';
import { date } from '../../utils/format';

export default function SharedPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(null);
  useEffect(() => { api.get('/plans/shared').then(({ data }) => setPlans(data.plans)); }, []);
  if (!plans) return <PageLoader />;
  return (
    <>
      <PageHeader title="Plans shared with you" subtitle="These are the wishes your loved ones have entrusted to you." />
      {!plans.length ? (
        <EmptyState
          icon={Heart}
          title="Nothing has been shared with you yet"
          text={`When someone adds ${user.email} as their nominee and finalizes their plan, it will appear here.`}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => (
            <Link key={p._id} to={`/nominee/plans/${p._id}`} className="card group p-6 transition hover:border-sage">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light font-serif text-lg text-sage-dark">{p.owner?.name?.[0]}</div>
                <div className="flex-1">
                  <h2 className="text-xl">{p.owner?.name}</h2>
                  <p className="text-sm text-muted">{p.title}{p.relation && ` · You are their ${p.relation.toLowerCase()}`}</p>
                  <p className="mt-2 flex items-center gap-1 text-sm text-ink-soft"><MapPin className="h-4 w-4" /> {p.city || '—'} · {p.servicesCount} services · Finalized {date(p.finalizedAt)}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-sage" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
