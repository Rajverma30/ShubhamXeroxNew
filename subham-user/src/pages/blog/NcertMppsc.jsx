import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'why-ncert', label: 'Why NCERT still wins' },
  { id: 'which-classes', label: 'Which classes to read' },
  { id: 'subject-plan', label: 'Subject-wise plan' },
  { id: 'after-ncert', label: 'What to read after NCERT' },
  { id: 'faq', label: 'FAQs' },
];

const FAQS = [
  {
    q: 'Are NCERT books enough for MPPSC?',
    a: 'NCERTs are essential for foundation but not enough alone. After NCERT, move to Laxmikanth, Spectrum, MP Special GK, Ghatna Chakra PYQs and current affairs.',
  },
  {
    q: 'Should MPPSC aspirants buy old or new NCERT?',
    a: 'Prefer clear, complete editions you will actually finish. For history/geography/polity basics, standard NCERT class sets used by UPSC/PCS aspirants work well — focus on finishing, not edition debates.',
  },
];

export default function NcertMppsc({ post, phone, whatsapp }) {
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
        'NCERT for MPPSC',
        'which NCERT books for MPPSC',
        'NCERT vs reference books MPPSC',
        'MPPSC foundation books',
        'NCERT Indore book store',
      ]}
      metaTitle="NCERT Books for MPPSC 2026 — Which Ones to Read"
      metaDescription="Which NCERT books to read for MPPSC 2026, class-wise list, subject plan, and what to buy after NCERT at Shubham Xerox Indore."
    >
      <section className="mb-12">
        <SectionTitle id="why-ncert">1. Why NCERT still wins for MPPSC foundations</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Coaching PDFs skip definitions. NCERT builds the language examiners expect in both Prelims MCQs and Mains answers.
          Especially after the <strong className="text-slate-900">2026 GS-only Mains</strong> shift, clear basics beat scattered advanced notes.
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="which-classes">2. Which classes to read (practical shortlist)</SectionTitle>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">NCERT focus</th>
                <th className="px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3 font-medium">History</td>
                <td className="px-4 py-3">Class 6–12 selective (esp. modern)</td>
                <td className="px-4 py-3">High</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Geography</td>
                <td className="px-4 py-3">Physical + India (9–12)</td>
                <td className="px-4 py-3">High</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Polity</td>
                <td className="px-4 py-3">Class 9–12 political science basics</td>
                <td className="px-4 py-3">Medium → then Laxmikanth</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Economy</td>
                <td className="px-4 py-3">Class 9–12 introductory eco</td>
                <td className="px-4 py-3">Medium</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Science</td>
                <td className="px-4 py-3">Class 6–10 selective for Prelims</td>
                <td className="px-4 py-3">Medium</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="subject-plan">3. Subject-wise 60-day NCERT sprint</SectionTitle>
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            'Days 1–20: History + make timeline sheets',
            'Days 21–40: Geography + atlas practice (India + MP)',
            'Days 41–55: Polity/Economy NCERT → transition to Laxmikanth',
            'Days 56–60: Science selective + revise all margin notes',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <SectionTitle id="after-ncert">4. What to read after NCERT</SectionTitle>
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          Move to the standard stack: Laxmikanth, Spectrum, MP GK, Ghatna Chakra, current affairs — detailed in{' '}
          <Link to="/blogs/mppsc-2026-best-books-list" className="font-semibold text-brand-600 underline">
            Top 10 MPPSC books
          </Link>{' '}
          and{' '}
          <Link to="/blogs/ghatna-chakra-purvavlokan-hindi-english" className="font-semibold text-brand-600 underline">
            Ghatna Chakra guide
          </Link>
          .
        </p>
        <ShopCta
          title="NCERT + MPPSC stack at Shubham Xerox"
          body="Pick foundation NCERTs and advanced MPPSC guides in one go — Bhawarkua store or online delivery."
          primaryTo="/category/mppsc-books"
          primaryLabel="Shop MPPSC Books"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">5. FAQs</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
