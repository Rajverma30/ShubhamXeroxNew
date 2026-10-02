import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, ExtLink, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'why-now', label: 'Why this booklist now' },
  { id: 'booklist', label: 'Constable booklist' },
  { id: 'syllabus-map', label: 'Syllabus → book map' },
  { id: '30-day', label: '30-day crash plan' },
  { id: 'faq', label: 'FAQs' },
];

const FAQS = [
  {
    q: 'Which books are best for MP Police Constable 2026?',
    a: 'MP GK guide, Lucent GK, R.S. Aggarwal (Maths), a reasoning book, Hindi Vyakaran, General English basics, and previous-year Constable papers — plus a PET/PMT fitness guide for the physical stage.',
  },
  {
    q: 'Is Lucent enough for Constable GK?',
    a: 'Lucent covers static national GK well, but you must add a dedicated Madhya Pradesh GK book and recent current affairs for state-level questions.',
  },
];

export default function ConstableBooks({ post, phone, whatsapp }) {
  return (
    <ArticleShell
      post={post}
      phone={phone}
      whatsapp={whatsapp}
      updatedLabel="Updated Oct 2026"
      readTime="~9 min read"
      toc={TOC}
      faqs={FAQS}
      keywords={[
        'MP Police Constable books 2026',
        'best books for MP Constable GD',
        'MPESB Constable preparation books',
        'MP Police syllabus books',
        'Constable GK Reasoning Maths',
        'Shubham Xerox Constable combo',
      ]}
      metaTitle="Best Books for MP Police Constable GD 2026 — Complete List"
      metaDescription="MP Police Constable 2026 booklist: MP GK, Lucent, RS Aggarwal, Reasoning, Hindi, English & PYQs. Buy Constable combo at Shubham Xerox Indore."
    >
      <section className="mb-12">
        <SectionTitle id="why-now">1. Why this booklist matters right now</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-3">
          With <strong className="text-slate-900">7,500 Constable (GD)</strong> posts live and CBT tentatively from{' '}
          <strong className="text-slate-900">19 November 2026</strong>, you need a focused objective-exam stack — not a full MPPSC
          shelf. Apply and track dates on <ExtLink href="https://esb.mp.gov.in/">esb.mp.gov.in</ExtLink>. Full vacancy context:{' '}
          <Link to="/blogs/mp-government-jobs-2026-guide" className="font-semibold text-brand-600 underline">
            MP Govt Jobs 2026 guide
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="booklist">2. Best books for MP Police Constable (GD)</SectionTitle>
        <div className="space-y-3">
          {[
            ['MP Samanya Gyan / MP Special GK', 'State facts, schemes, districts, police-related static'],
            ['Lucent’s General Knowledge', 'National static GK + science one-liners'],
            ['R.S. Aggarwal — Quantitative Aptitude', 'Arithmetic for CBT speed'],
            ['Verbal & Non-Verbal Reasoning guide', 'Series, coding, analogy, puzzles'],
            ['Hindi Vyakaran (MP Board aligned)', 'Grammar + comprehension style Qs'],
            ['General English (competitive basics)', 'Error spotting, vocab, comprehension'],
            ['MP Police Constable previous papers', 'Real difficulty + time management'],
            ['PET/PMT fitness guide', 'Running practice plan + measurement standards'],
          ].map(([name, why]) => (
            <div key={name} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="font-bold text-slate-900 text-sm">{name}</p>
              <p className="text-sm text-slate-600 mt-0.5">{why}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="syllabus-map">3. Syllabus → book map</SectionTitle>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-4 py-3">CBT area</th>
                <th className="px-4 py-3">Primary book</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="px-4 py-3">GK &amp; Current Affairs</td><td className="px-4 py-3">MP GK + Lucent + monthly CA</td></tr>
              <tr><td className="px-4 py-3">Maths</td><td className="px-4 py-3">R.S. Aggarwal (selected chapters)</td></tr>
              <tr><td className="px-4 py-3">Reasoning</td><td className="px-4 py-3">Standard verbal/non-verbal book</td></tr>
              <tr><td className="px-4 py-3">Hindi / English</td><td className="px-4 py-3">Vyakaran + competitive English basics</td></tr>
              <tr><td className="px-4 py-3">Science</td><td className="px-4 py-3">Lucent science section</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="30-day">4. 30-day crash plan</SectionTitle>
        <ul className="space-y-2 text-sm text-slate-600 mb-4">
          {[
            'Daily: 1 hr Maths + 1 hr Reasoning + 1 hr GK/CA',
            'Alternate days: Hindi / English grammar drills',
            'Every Sunday: 1 full Constable mock (timed)',
            'Parallel: PET running practice 4–5 days/week',
            'Last 7 days: only PYQs + weak-topic revision',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <ShopCta
          title="MP Police Constable combo at Shubham Xerox"
          body="GK + Reasoning + Maths + Hindi/English + PYQs — bundled for Constable aspirants. Print admit cards & forms in-store."
          primaryTo="/category/mpesb-books"
          primaryLabel="Shop MPESB Books"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">5. FAQs</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
