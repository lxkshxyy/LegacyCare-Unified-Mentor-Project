import { Link } from 'react-router-dom';
import {
  Lock, BadgeCheck, Users, FileHeart, Store, Wallet, FolderLock, Compass, ArrowRight, ClipboardList, Flower2, UserPlus, HeartHandshake, ChevronDown,
} from 'lucide-react';
import { LotusMark } from '../../components/ui';
import { CATEGORY_ICON } from '../../components/ServiceCard';
import { SERVICE_CATEGORIES } from '../../utils/format';
import { FAQS } from '../../data/faqs';

const STEPS = [
  { icon: ClipboardList, title: 'Create your plan', text: 'Record where and how you wish your last rites to be held — at your own pace.' },
  { icon: Flower2, title: 'Choose rituals & providers', text: 'Pick your tradition, officiant and verified service providers with clear prices.' },
  { icon: UserPlus, title: 'Add your nominee', text: 'Choose the family member or friend who should carry out your wishes.' },
  { icon: HeartHandshake, title: 'Rest easy', text: 'Your plan is encrypted and saved. Your nominee sees it only when you allow it.' },
];

const FEATURES = [
  { icon: FileHeart, title: 'A private wishes vault', text: 'Music, prayers, customs and personal notes — encrypted and safe.' },
  { icon: Store, title: 'Verified providers', text: 'Funeral agencies, transport, flowers and pandits checked by our team.' },
  { icon: Wallet, title: 'Budget clarity', text: 'See every service and its price add up, with no surprises later.' },
  { icon: Users, title: 'Family access', text: 'Give nominees secure access, and revoke it any time.' },
  { icon: FolderLock, title: 'Document storage', text: 'Keep pledge cards, IDs and letters together with your plan.' },
  { icon: Compass, title: 'Gentle guidance', text: 'A step-by-step checklist helps your family when the time comes.' },
];

const TRADITIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Non-religious'];

function HeroArt() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sage-light via-ivory to-gold-light" />
      <div className="absolute inset-8 rounded-full border border-gold/40" />
      <div className="absolute inset-16 flex items-center justify-center rounded-full bg-white shadow-[0_20px_60px_-20px_rgba(91,123,106,0.45)]">
        <svg viewBox="0 0 200 200" className="h-3/4 w-3/4" aria-hidden="true">
          <defs>
            <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E6EEE9" />
              <stop offset="1" stopColor="#5B7B6A" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="70" r="26" fill="#F6EFE0" />
          <path d="M100 40c14 14 14 42 0 62-14-20-14-48 0-62z" fill="url(#petal)" opacity=".95" />
          <path d="M100 102c-10-22-30-34-52-31 3 22 24 37 52 31z" fill="url(#petal)" opacity=".8" />
          <path d="M100 102c10-22 30-34 52-31-3 22-24 37-52 31z" fill="url(#petal)" opacity=".8" />
          <path d="M100 104c-18-10-40-8-58 6 16 12 40 12 58-6z" fill="#5B7B6A" opacity=".55" />
          <path d="M100 104c18-10 40-8 58 6-16 12-40 12-58-6z" fill="#5B7B6A" opacity=".55" />
          <path d="M40 130h120" stroke="#C8A96A" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 142h80" stroke="#E7E1D8" strokeWidth="3" strokeLinecap="round" />
          <g transform="translate(86 150)">
            <path d="M14 0c-3 5-5 8-5 11a5 5 0 0010 0c0-3-2-6-5-11z" fill="#C8A96A" />
            <path d="M0 18h28l-4 8H4z" fill="#B5838D" opacity=".8" />
          </g>
        </svg>
      </div>
      <div className="absolute -left-2 top-16 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm shadow-lg sm:flex">
        <Lock className="h-4 w-4 text-sage" /> Encrypted & private
      </div>
      <div className="absolute -right-2 bottom-20 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm shadow-lg sm:flex">
        <BadgeCheck className="h-4 w-4 text-sage" /> Verified providers
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light px-3 py-1 text-sm text-sage-dark">
              <LotusMark className="h-4 w-4" /> On your terms, with dignity
            </p>
            <h1 className="text-4xl leading-tight sm:text-5xl lg:text-[3.5rem]">
              Plan with dignity. <span className="text-sage">Leave behind clarity,</span> not confusion.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              LegacyCare helps you plan your funeral and last rites in advance — honouring your personal, cultural and religious wishes, and sparing your loved ones from rushed decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">Start your plan <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/providers" className="btn-secondary px-6 py-3 text-base">Find a provider</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-sage" /> Encrypted & private</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-sage" /> Verified providers</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-sage" /> Family access</span>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">How it works</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Four quiet steps to peace of mind</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="relative rounded-2xl bg-ivory p-6">
                <span className="absolute right-5 top-4 font-serif text-4xl text-line">{i + 1}</span>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="h-6 w-6 text-sage" />
                </div>
                <h3 className="text-lg">{title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/how-it-works" className="link">See the full process <ArrowRight className="inline h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Traditions */}
      <section className="py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-gold">Every tradition, respected</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Your faith. Your customs. Your way.</h2>
            <p className="mt-4 text-ink-soft">
              From Antyeshti and Janazah to a simple celebration of life — choose your rituals, your officiant and the customs that matter to you. Our categories are curated with care, and you can always write your own.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRADITIONS.map((t) => (
              <div key={t} className="card flex flex-col items-center gap-2 px-3 py-5 text-center">
                <LotusMark className="h-7 w-7 opacity-80" />
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">Why LegacyCare</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Everything your family will need, in one place</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-line p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-light">
                  <Icon className="h-5 w-5 text-sage" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider categories */}
      <section className="py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-gold">Find a provider</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Trusted services near you</h2>
            </div>
            <Link to="/providers" className="btn-secondary">Browse all providers</Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(SERVICE_CATEGORIES).filter(([k]) => k !== 'other').map(([k, label]) => {
              const Icon = CATEGORY_ICON[k];
              return (
                <Link key={k} to={`/providers?category=${k}`} className="card group flex flex-col items-center gap-3 px-3 py-6 text-center transition hover:border-sage">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-light transition group-hover:bg-sage">
                    <Icon className="h-6 w-6 text-sage transition group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="pb-4">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl">What should I know?</h2>
            <div className="mt-6 space-y-3">
              {FAQS.slice(0, 4).map((f) => (
                <details key={f.q} className="card group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {f.q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
            <Link to="/faq" className="link mt-4 inline-block">All frequently asked questions</Link>
          </div>
          <div className="flex flex-col justify-center rounded-3xl bg-sage p-8 text-white sm:p-10">
            <p className="text-sm uppercase tracking-widest text-white/70">Are you prepared?</p>
            <h2 className="mt-2 text-3xl text-white">It takes about 20 minutes to give your family a lifetime of clarity.</h2>
            <p className="mt-4 text-white/80">
              Start with the basics today. You can save a draft, come back any time, and change your wishes whenever you like.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn bg-white text-sage-dark hover:bg-ivory">Start your plan</Link>
              <Link to="/how-it-works" className="btn border border-white/40 text-white hover:bg-white/10">Planning checklist</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
