import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'how-much', label: 'How much CA is enough' },
  { id: 'sources', label: 'Best sources 2026' },
  { id: 'monthly-plan', label: 'Monthly revision plan' },
  { id: 'mp-focus', label: 'MP-specific CA' },
  { id: 'faq', label: 'FAQs' },
];

const FAQS = [
  {
    q: 'Which current affairs magazine is best for MPPSC?',
    a: 'Pick one monthly (eg. Speedy or equivalent) and finish it completely. Adding three magazines creates backlog — consistency beats variety.',
  },
  {
    q: 'How many months of current affairs for MPPSC Prelims?',
    a: 'Cover at least the last 12 months thoroughly, plus the month of the exam for last-minute schemes and appointments. Add MP budget and state schemes separately.',
  },
];

export default function CurrentAffairsMppsc({ post, phone, whatsapp }) {
  return (
    <ArticleShell
      post={post}
      phone={phone}
      whatsapp={whatsapp}
      updatedLabel="Updated Oct 2026"
      readTime="~8 min read"
      toc={TOC}
      faqs={FAQS}
      keywords={[
        'current affairs for MPPSC 2026',
        'best current affairs magazine MPPSC',
        'Speedy current affairs',
        'MP state current affairs',
        'how to prepare CA for MPPSC',
        'current affairs books Indore',
      ]}
      metaTitle="Best Current Affairs Strategy for MPPSC 2026"
      metaDescription="MPPSC 2026 current affairs plan: monthly magazines, 12-month coverage, MP schemes & Budget. Buy Speedy/CA books at Shubham Xerox Indore."
    >
      <section className="mb-12">
        <SectionTitle id="how-much">1. How much current affairs is enough?</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          For MPPSC Prelims, aim for <strong className="text-slate-900">12 months of national CA</strong> +{' '}
          <strong className="text-slate-900">Madhya Pradesh schemes, appointments, budget highlights and state reports</strong>.
          Mains needs the same facts turned into examples inside GS answers — not a separate infinite magazine pile.
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="sources">2. Best sources for 2026</SectionTitle>
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            'One monthly CA magazine (Speedy or similar) — finish cover to cover',
            'Daily 20–30 min newspaper / trusted daily CA notes',
            'Union Budget + Economic Survey short notes',
            'MP Budget / state scheme compilations',
            'Revision from Ghatna Chakra / PYQ themes that repeat in CA-linked questions',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          Pair with static books from our{' '}
          <Link to="/blogs/mppsc-2026-best-books-list" className="font-semibold text-brand-600 underline">
            Top 10 MPPSC list
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="monthly-plan">3. Monthly revision plan</SectionTitle>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 leading-relaxed">
          <li>Week 1–3: daily CA + mark MP-relevant news in a thin notebook.</li>
          <li>Week 4: revise the full monthly magazine + 50 MCQs.</li>
          <li>Every 90 days: consolidate into one “quarter sheet” of schemes &amp; reports.</li>
          <li>Last 30 days before Prelims: only revision sheets — no new magazines.</li>
        </ol>
      </section>

      <section className="mb-12">
        <SectionTitle id="mp-focus">4. MP-specific current affairs (do not skip)</SectionTitle>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          National magazines under-index state content. Keep a dedicated page for MP cabinet news, state schemes, sports,
          culture events and district initiatives. This is where Indore coaching students often gain an edge — and where a
          physical MP GK + CA shelf at Bhawarkua helps.
        </p>
        <ShopCta
          title="Current affairs & MP GK at Shubham Xerox"
          primaryTo="/category/current-affairs-books"
          primaryLabel="Shop Current Affairs"
          secondaryTo="/category/mppsc-books"
          secondaryLabel="MPPSC Books"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">5. FAQs</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
