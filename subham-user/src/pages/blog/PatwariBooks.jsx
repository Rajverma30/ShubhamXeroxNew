import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, ExtLink, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'exam-snapshot', label: 'Patwari exam snapshot' },
  { id: 'books', label: 'Best books list' },
  { id: 'overlap', label: 'Overlap with other MPESB posts' },
  { id: 'plan', label: '8-week plan' },
  { id: 'faq', label: 'FAQs' },
];

const FAQS = [
  {
    q: 'Which books are best for MP Patwari / MPESB Group exams?',
    a: 'MP GK, Lucent GK, RS Aggarwal Maths, Reasoning, Hindi Vyakaran, basic computer awareness where notified, plus previous-year CRT papers. Confirm the exact syllabus on the latest esb.mp.gov.in advertisement.',
  },
  {
    q: 'Can I use Constable books for Patwari?',
    a: 'There is heavy overlap in GK, Maths, Reasoning and Hindi. Add computer awareness and any Patwari-specific revenue basics if the notification includes them.',
  },
];

export default function PatwariBooks({ post, phone, whatsapp }) {
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
        'MP Patwari books',
        'MPESB Patwari preparation',
        'best books for Patwari Madhya Pradesh',
        'Vyapam Group C books',
        'MPESB exam books Indore',
        'Patwari syllabus books',
      ]}
      metaTitle="Best Books for MP Patwari & MPESB Exams 2026"
      metaDescription="MP Patwari / MPESB booklist 2026: MP GK, Lucent, Maths, Reasoning, Hindi & PYQs. Overlap with Constable + shop at Shubham Xerox Indore."
    >
      <section className="mb-12">
        <SectionTitle id="exam-snapshot">1. Patwari / MPESB snapshot</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-3">
          Madhya Pradesh Patwari and related Group recruitments run through{' '}
          <ExtLink href="https://esb.mp.gov.in/">MPESB (esb.mp.gov.in)</ExtLink>. Windows open and close quickly — treat your
          book stack as reusable across Constable, Clerk and Patwari-style papers. Track live vacancies in our{' '}
          <Link to="/blogs/mp-government-jobs-2026-guide" className="font-semibold text-brand-600 underline">
            MP Government Jobs guide
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="books">2. Best books for MP Patwari preparation</SectionTitle>
        <div className="space-y-3">
          {[
            ['MP Special GK / Samanya Gyan', 'Highest ROI for state exams'],
            ['Lucent GK', 'Static national coverage'],
            ['R.S. Aggarwal Quantitative Aptitude', 'Speed + accuracy for arithmetic'],
            ['Reasoning (verbal & non-verbal)', 'Standard CRT patterns'],
            ['Hindi Vyakaran guide', 'Grammar-heavy papers'],
            ['Computer awareness (objective)', 'When syllabus includes IT basics'],
            ['Previous year MPESB / Patwari papers', 'Difficulty calibration'],
          ].map(([n, w]) => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="font-bold text-slate-900 text-sm">{n}</p>
              <p className="text-sm text-slate-600">{w}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="overlap">3. Smart overlap with other posts</SectionTitle>
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          If you are also writing <strong className="text-slate-900">MP Police Constable</strong>, keep one shared GK + Maths +
          Reasoning shelf and only add Patwari-specific extras. See{' '}
          <Link to="/blogs/mp-police-constable-best-books-2026" className="font-semibold text-brand-600 underline">
            Constable booklist
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="plan">4. 8-week preparation outline</SectionTitle>
        <ul className="space-y-2 text-sm text-slate-600 mb-4">
          {[
            'Weeks 1–3: finish Maths basics + Reasoning foundations',
            'Weeks 2–5: MP GK + Lucent in parallel (daily split)',
            'Weeks 4–6: Hindi grammar drills + computer MCQs',
            'Weeks 6–8: PYQs + 2 full mocks per week',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <ShopCta
          title="MPESB & Patwari books at Shubham Xerox"
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
