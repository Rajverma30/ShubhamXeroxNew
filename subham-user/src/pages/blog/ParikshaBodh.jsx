import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'quick-verdict', label: 'Quick verdict' },
  { id: 'comparison', label: 'Pariksha Bodh vs Adhyayan' },
  { id: 'class10', label: 'Class 10th recommendation' },
  { id: 'class12', label: 'Class 12th recommendation' },
  { id: 'how-to-use', label: 'How to use with textbooks' },
  { id: 'faq', label: 'FAQs' },
];

const FAQS = [
  {
    q: 'Is Pariksha Bodh better than Pariksha Adhyayan for MP Board?',
    a: 'For most Class 10 and 12 students aiming board + competitive overlap, Yugbodh Pariksha Bodh is the safer first buy because of wider question practice. Navbodh Pariksha Adhyayan is stronger when you want tighter chapter revision aligned to the textbook.',
  },
  {
    q: 'Can I use only guidebooks without NCERT/MP Board textbooks?',
    a: 'No. Guides are for practice and pattern. Read the official textbook first, then solve Bodh/Adhyayan chapter-wise.',
  },
  {
    q: 'Where to buy Pariksha Bodh in Indore?',
    a: 'Shubham Xerox at Bhawarkua stocks Class 10th and 12th MP Board guides, sample papers and stationery for board season.',
  },
];

export default function ParikshaBodh({ post, phone, whatsapp }) {
  return (
    <ArticleShell
      post={post}
      phone={phone}
      whatsapp={whatsapp}
      updatedLabel="Updated Aug 2026"
      readTime="~8 min read"
      toc={TOC}
      faqs={FAQS}
      keywords={[
        'Pariksha Bodh vs Pariksha Adhyayan',
        'Yugbodh Pariksha Bodh 2026',
        'Navbodh Pariksha Adhyayan',
        'MP Board Class 10 books',
        'MP Board Class 12 books',
        'best guide for MP Board',
        'Pariksha Bodh Indore',
      ]}
      metaTitle="Pariksha Bodh vs Pariksha Adhyayan — MP Board 10th & 12th 2026"
      metaDescription="MP Board 2026: Yugbodh Pariksha Bodh vs Navbodh Pariksha Adhyayan compared for Class 10 & 12. Which guide to buy and where in Indore."
    >
      <section className="mb-12">
        <SectionTitle id="quick-verdict">1. Quick verdict</SectionTitle>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-sm text-slate-600 leading-relaxed space-y-3">
          <p>
            <strong className="text-slate-900">Buy Pariksha Bodh (Yugbodh)</strong> if you want maximum question practice,
            sample papers and exam-style drilling for MP Board 2026.
          </p>
          <p>
            <strong className="text-slate-900">Buy Pariksha Adhyayan (Navbodh)</strong> if you prefer cleaner chapter-wise
            revision notes tightly mapped to the textbook and less bulk.
          </p>
          <p>
            Many toppers keep <strong className="text-slate-900">textbook + one primary guide</strong>. Owning both is useful
            only if you have time to finish both — otherwise pick one and finish it 100%.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="comparison">2. Side-by-side comparison</SectionTitle>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-4 py-3 font-semibold">Factor</th>
                <th className="px-4 py-3 font-semibold">Pariksha Bodh (Yugbodh)</th>
                <th className="px-4 py-3 font-semibold">Pariksha Adhyayan (Navbodh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3 font-medium">Best for</td>
                <td className="px-4 py-3">Heavy practice &amp; paper pattern</td>
                <td className="px-4 py-3">Chapter revision &amp; clarity</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Question volume</td>
                <td className="px-4 py-3">Usually higher</td>
                <td className="px-4 py-3">More selective</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Ideal student</td>
                <td className="px-4 py-3">Average → board scorer needing drills</td>
                <td className="px-4 py-3">Students who already read textbooks well</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Board season use</td>
                <td className="px-4 py-3">Last 90 days mock practice</td>
                <td className="px-4 py-3">Ongoing chapter completion</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Our store tip</td>
                <td className="px-4 py-3">Default recommendation for most parents</td>
                <td className="px-4 py-3">Great second guide / light alternative</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="class10">3. Class 10th — what to buy</SectionTitle>
        <ul className="space-y-2 text-sm text-slate-600 mb-4">
          {[
            'MP Board textbooks (all subjects) — non-negotiable',
            'Pariksha Bodh for Maths, Science, Social Science (priority)',
            'Hindi / English grammar practice workbook',
            'Previous year board papers + 3 full sample sets',
            'Graph notebook, geometry box, highlighters for last-month revision',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-600">
          Pair with our{' '}
          <Link to="/blogs/essential-stationery-for-mppsc-aspirants" className="font-semibold text-brand-600 underline">
            stationery checklist
          </Link>{' '}
          for a complete desk setup.
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="class12">4. Class 12th — stream-wise tip</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-2">Science</h3>
            <p className="text-slate-600 leading-relaxed">Textbook + Bodh for Physics/Chemistry/Maths or Bio. Keep formula registers separate.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-2">Commerce</h3>
            <p className="text-slate-600 leading-relaxed">Accountancy &amp; Business Studies need chapter-end numericals — Bodh-style practice helps more.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-2">Arts</h3>
            <p className="text-slate-600 leading-relaxed">History/Polity/Geography: Adhyayan-style revision + map practice works well with textbooks.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="how-to-use">5. How to use guides with textbooks</SectionTitle>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 leading-relaxed mb-4">
          <li>Read textbook chapter → make 1-page notes.</li>
          <li>Solve in-text / exercise questions.</li>
          <li>Then finish the same chapter in Bodh or Adhyayan.</li>
          <li>Every Sunday: one timed sample paper.</li>
          <li>Last 30 days: only weak chapters + full papers — no new guides.</li>
        </ol>
        <ShopCta
          title="MP Board guides & stationery at Shubham Xerox"
          body="Class 10th & 12th Pariksha Bodh / Adhyayan, sample papers, notebooks and geometry sets — Bhawarkua Indore + India delivery."
          primaryTo="/shop"
          primaryLabel="Shop School Books"
          secondaryTo="/stationery"
          secondaryLabel="Stationery"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">6. Frequently Asked Questions</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
