import { Link } from 'react-router-dom';
import { FiCheckCircle, FiMapPin } from 'react-icons/fi';
import { ArticleShell, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'why-local', label: 'Why local stock matters' },
  { id: 'what-to-buy', label: 'What to buy in one visit' },
  { id: 'bhawarkua', label: 'Bhawarkua store guide' },
  { id: 'online', label: 'Order online across India' },
  { id: 'faq', label: 'FAQs' },
];

const FAQS = [
  {
    q: 'Where can I buy MPPSC books in Indore?',
    a: 'Shubham Xerox near Bhawarkua Square stocks Ghatna Chakra, MP Special GK, Laxmikanth, Spectrum, current affairs, Mains guides and stationery, with same-day pickup during store hours.',
  },
  {
    q: 'Does Shubham Xerox deliver MPPSC books outside Indore?',
    a: 'Yes — order on shubhamxerox.in for delivery across India, or visit the Bhawarkua store if you are in Indore.',
  },
];

export default function BuyMppscIndore({ post, phone, whatsapp }) {
  return (
    <ArticleShell
      post={post}
      phone={phone}
      whatsapp={whatsapp}
      updatedLabel="Updated Oct 2026"
      readTime="~7 min read"
      toc={TOC}
      faqs={FAQS}
      keywords={[
        'buy MPPSC books in Indore',
        'MPPSC book store Bhawarkua',
        'best book shop Indore for MPPSC',
        'Ghatna Chakra buy Indore',
        'Shubham Xerox Bhawarkua',
        'MPPSC books near me Indore',
      ]}
      metaTitle="Where to Buy MPPSC Books in Indore (Bhawarkua) 2026"
      metaDescription="Buy original MPPSC books in Indore at Shubham Xerox Bhawarkua — Ghatna Chakra, MP GK, Laxmikanth, Mains guides. Store pickup + India delivery."
    >
      <section className="mb-12">
        <SectionTitle id="why-local">1. Why buying local (the right shop) still wins</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Online marketplaces often ship wrong editions or delayed current-affairs monthlies. For MPPSC, edition freshness and
          Hindi/English language match matter. A serious Indore store lets you check the spine, confirm the year, and grab
          photocopy/notes printouts the same evening.
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="what-to-buy">2. What to buy in one Bhawarkua visit</SectionTitle>
        <ul className="space-y-2 text-sm text-slate-600 mb-4">
          {[
            'Ghatna Chakra Purvavlokan set (priority subjects first)',
            'MP Special GK + latest Speedy/CA monthly',
            'Laxmikanth + Spectrum (if not already owned)',
            'MPPSC Mains answer-writing guide',
            'CSAT practice book + rough spiral register',
            'Highlighter + sticky flags for revision',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-600">
          Full ranked list:{' '}
          <Link to="/blogs/mppsc-2026-best-books-list" className="font-semibold text-brand-600 underline">
            Top 10 MPPSC books 2026
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="bhawarkua">3. Shubham Xerox — Bhawarkua Square</SectionTitle>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-sm text-slate-600 space-y-3">
          <p className="flex gap-2">
            <FiMapPin className="text-brand-600 mt-0.5 shrink-0" />
            <span>
              Near Bhawarkua Square, Main Road, Indore, MP 452001 —{' '}
              <Link to="/store-indore" className="font-semibold text-brand-600 underline">
                full store page &amp; timings
              </Link>
            </span>
          </p>
          <p>Mon–Sat 9:00 AM – 9:30 PM · Sunday 10:00 AM – 7:00 PM</p>
          <p>
            Ask for <strong className="text-slate-900">MPPSC combo</strong> or{' '}
            <strong className="text-slate-900">Ghatna Chakra subject-wise</strong> — staff can match Hindi/English editions on the spot.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="online">4. Not in Indore? Order online</SectionTitle>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          The same catalogue ships across India via{' '}
          <Link to="/shop" className="font-semibold text-brand-600 underline">
            shubhamxerox.in/shop
          </Link>
          . Prefer category shortcuts:{' '}
          <Link to="/category/mppsc-books" className="font-semibold text-brand-600 underline">
            MPPSC books
          </Link>
          ,{' '}
          <Link to="/category/ghatna-chakra-books" className="font-semibold text-brand-600 underline">
            Ghatna Chakra
          </Link>
          ,{' '}
          <Link to="/category/current-affairs-books" className="font-semibold text-brand-600 underline">
            Current affairs
          </Link>
          .
        </p>
        <ShopCta
          title="Visit store or order MPPSC books online"
          primaryTo="/category/mppsc-books"
          primaryLabel="Shop MPPSC"
          secondaryTo="/store-indore"
          secondaryLabel="Bhawarkua Store"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">5. FAQs</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
