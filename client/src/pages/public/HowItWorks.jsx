import { Link } from 'react-router-dom';
import { ClipboardList, Flower2, BookOpen, Music, Store, UserPlus, FolderUp, CheckCircle2, Eye, Phone, ListChecks, ShieldCheck, Tag, Inbox } from 'lucide-react';

const JOURNEYS = [
  {
    title: 'For planners',
    intro: 'Seven gentle steps. Save a draft at any point.',
    steps: [
      [ClipboardList, 'Basics & location', 'Preferred venue, city and cremation / burial preference.'],
      [Flower2, 'Rituals', 'Religious or non-religious, your tradition and ritual category.'],
      [BookOpen, 'Officiant', 'Pandit, priest, imam, granthi or celebrant — and who, if you know.'],
      [Music, 'Ceremony', 'Music, prayers, customs, dress code and anything else (encrypted).'],
      [Store, 'Services & budget', 'Choose verified providers and see the estimated total.'],
      [UserPlus, 'Nominees', 'Add family members or friends and control their access.'],
      [FolderUp, 'Documents', 'Upload pledge cards, IDs or letters. Then finalize.'],
    ],
  },
  {
    title: 'For family & nominees',
    intro: 'Clarity when it matters most.',
    steps: [
      [Eye, 'View the plan', 'Log in with the email the planner added to see the finalized plan.'],
      [FolderUp, 'Download documents', 'Print the plan and download every attached document.'],
      [Phone, 'Contact providers', 'Call or email the chosen providers, or send a request in one click.'],
      [ListChecks, 'Follow the guide', 'A step-by-step checklist of what to do and when.'],
    ],
  },
  {
    title: 'For service providers',
    intro: 'Reach families who have planned ahead.',
    steps: [
      [ShieldCheck, 'Get verified', 'Register with your business and licence details.'],
      [Tag, 'List services', 'Add services with transparent pricing and availability.'],
      [Inbox, 'Handle requests', 'Accept, decline and complete requests from families.'],
    ],
  },
];

export default function HowItWorks() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-gold">How it works</p>
        <h1 className="mt-2 text-4xl">A calm, clear process for everyone involved</h1>
        <p className="mt-3 text-ink-soft">LegacyCare connects the person planning, the family who will carry out the wishes, and the providers who make it happen.</p>
      </div>
      <div className="mt-12 space-y-12">
        {JOURNEYS.map((j) => (
          <section key={j.title}>
            <h2 className="text-2xl">{j.title}</h2>
            <p className="text-muted">{j.intro}</p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {j.steps.map(([Icon, t, d], i) => (
                <li key={t} className="card p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light"><Icon className="h-5 w-5 text-sage" /></span>
                    <span className="text-xs font-medium text-muted">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-3 font-sans text-base font-semibold">{t}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{d}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <section id="checklist" className="card mt-14 p-8">
        <h2 className="text-2xl">Planning checklist</h2>
        <p className="text-muted">Useful to think about before you begin.</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            'Burial, cremation or body donation?', 'Where should the ceremony be held?', 'Which rituals and which officiant?',
            'Music, prayers or readings you love', 'Who should carry out your wishes?', 'A comfortable budget for your family',
            'Eye / organ donation pledge card', 'People who must be informed',
          ].map((c) => (
            <li key={c} className="flex items-start gap-2 text-ink-soft"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" /> {c}</li>
          ))}
        </ul>
        <Link to="/register" className="btn-primary mt-6">Start your plan</Link>
      </section>
    </div>
  );
}
