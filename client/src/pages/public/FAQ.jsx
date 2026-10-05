import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQS } from '../../data/faqs';



export default function FAQ() {
  return (
    <div className="container-page max-w-3xl py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold">Help centre</p>
      <h1 className="mt-2 text-4xl">Frequently asked questions</h1>
      <p className="mt-3 text-ink-soft">Gentle answers to the questions people ask us most.</p>
      <div className="mt-10 space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="card group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {f.q}
              <ChevronDown className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="card mt-10 p-6 text-center">
        <p className="text-ink-soft">Still have a question? Write to <span className="font-medium text-ink">care@legacycare.in</span></p>
        <Link to="/register" className="btn-primary mt-4">Start your plan</Link>
      </div>
    </div>
  );
}
