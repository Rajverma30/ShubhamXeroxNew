import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'what-is', label: 'What is Purvavlokan?' },
  { id: 'why-must', label: 'Why it is a must-have' },
  { id: 'subjects', label: 'Subject-wise use' },
  { id: 'how-to-read', label: 'How to read it correctly' },
  { id: 'hindi-english', label: 'Hindi vs English edition' },
  { id: 'who-should', label: 'Who should buy it' },
  { id: 'faq', label: 'FAQs' },
];

const FAQS = [
  {
    q: 'Is Ghatna Chakra Purvavlokan enough to clear MPPSC?',
    a: 'No single book is enough. Purvavlokan is outstanding for previous-year questions and topic drilling, but you still need NCERTs, standard textbooks (Laxmikanth, Spectrum), MP Special GK and current affairs.',
  },
  {
    q: 'Should I buy Ghatna Chakra in Hindi or English?',
    a: 'If you write Mains in Hindi and think in Hindi, buy the Hindi set. English is fine for bilingual aspirants, but stick to one language for notes to avoid confusion.',
  },
  {
    q: 'Which Ghatna Chakra books are most important for beginners?',
    a: 'Start with History, Polity, Geography and Economy volumes. Add Environment and Science after your NCERT base is stable.',
  },
  {
    q: 'Where can I buy original Ghatna Chakra books in Indore?',
    a: 'Shubham Xerox, Bhawarkua Square stocks the Purvavlokan / Samanya Adhyayan series with current editions and can bundle it with MPPSC or SSC kits.',
  },
];

export default function GhatnaChakra({ post, phone, whatsapp }) {
  return (
    <ArticleShell
      post={post}
      phone={phone}
      whatsapp={whatsapp}
      updatedLabel="Updated Aug 2026"
      readTime="~9 min read"
      toc={TOC}
      faqs={FAQS}
      keywords={[
        'Ghatna Chakra Purvavlokan',
        'Ghatna Chakra Samanya Adhyayan',
        'Ghatna Chakra for MPPSC',
        'Ghatna Chakra Hindi',
        'best book for competitive exams MP',
        'Ghatna Chakra Indore',
        'SSC Railway Ghatna Chakra',
      ]}
      metaTitle="Ghatna Chakra Purvavlokan: Why It Is Must-Have for MPPSC & SSC"
      metaDescription="Why Ghatna Chakra Purvavlokan is essential for MPPSC, SSC & Railway. Subject-wise strategy, Hindi vs English, and where to buy in Indore at Shubham Xerox."
    >
      <section className="mb-12">
        <SectionTitle id="what-is">1. What is Ghatna Chakra Purvavlokan?</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
          <strong className="text-slate-900">Ghatna Chakra Purvavlokan (Samanya Adhyayan)</strong> is a subject-wise previous-year
          question + concept series used heavily by MPPSC, SSC CGL/CHSL, Railway and state PCS aspirants across Hindi-belt states.
          Each volume groups questions topic-wise so you see exactly how examiners twist History, Geography, Polity, Economy,
          Environment and Science.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          At <Link to="/store-indore" className="font-semibold text-brand-600 underline">Shubham Xerox Indore</Link>, this series
          is one of our fastest-moving competitive shelves — usually bought with{' '}
          <Link to="/blogs/mppsc-2026-best-books-list" className="font-semibold text-brand-600 underline">
            the full MPPSC top-10 stack
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="why-must">2. Why it is a must-have (not optional)</SectionTitle>
        <ul className="space-y-3 text-sm text-slate-600">
          {[
            'Shows real exam language — not just theory paragraphs.',
            'Topic-wise PYQs expose weak chapters faster than random mocks.',
            'Works across exams: one History volume helps MPPSC + SSC + Railway.',
            'Ideal second-layer resource after NCERT / standard textbooks.',
            'Hindi edition matches how most MP aspirants write Mains answers.',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <SectionTitle id="subjects">3. Subject-wise how to use each volume</SectionTitle>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-4 py-3 font-semibold">Volume</th>
                <th className="px-4 py-3 font-semibold">Best for</th>
                <th className="px-4 py-3 font-semibold">How to use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">History</td>
                <td className="px-4 py-3">MPPSC, SSC, Railway</td>
                <td className="px-4 py-3">After Spectrum/NCERT — drill medieval + modern PYQs</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Geography</td>
                <td className="px-4 py-3">Prelims map &amp; physical Qs</td>
                <td className="px-4 py-3">Keep an atlas open; mark India + MP map facts</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Polity</td>
                <td className="px-4 py-3">Constitutional articles</td>
                <td className="px-4 py-3">Pair every chapter with Laxmikanth revision</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Economy</td>
                <td className="px-4 py-3">Basic concepts + schemes</td>
                <td className="px-4 py-3">Update with latest Budget / Economic Survey notes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Environment</td>
                <td className="px-4 py-3">Prelims scoring area</td>
                <td className="px-4 py-3">Revise acts, bodies, MP biodiversity separately</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Science</td>
                <td className="px-4 py-3">SSC + MPESB overlap</td>
                <td className="px-4 py-3">Do Lucent + this volume for applied MCQs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="how-to-read">4. How to read Ghatna Chakra the right way</SectionTitle>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 leading-relaxed">
          <li>Never start Purvavlokan as your first book — finish NCERT/standard text for that subject first.</li>
          <li>Solve topic blocks with a timer; mark “silly mistake” vs “concept gap” separately.</li>
          <li>Maintain a thin error notebook — rewrite only wrong concepts, not entire chapters.</li>
          <li>Re-attempt marked questions after 7 days and again before the exam.</li>
          <li>In the last 45 days, use it as a revision scanner, not a learning source.</li>
        </ol>
      </section>

      <section className="mb-12">
        <SectionTitle id="hindi-english">5. Hindi vs English edition</SectionTitle>
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          Most Madhya Pradesh aspirants should prefer <strong className="text-slate-900">Hindi Purvavlokan</strong> because
          MPPSC Mains answers are commonly written in Hindi and question phrasing matches Hindi editorial style.
          Choose English only if your entire note-making and mock practice is already in English.
        </p>
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Tip: Do not mix Hindi book + English notes for the same subject — it slows recall in timed tests.
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="who-should">6. Who should buy it?</SectionTitle>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 mb-4">
          <li>MPPSC State Service Prelims aspirants (all cycles)</li>
          <li>SSC CGL / CHSL / GD candidates needing static PYQ practice</li>
          <li>Railway NTPC / Group-D aspirants overlapping GS</li>
          <li>MPESB Group exams where GS weightage is high</li>
        </ul>
        <ShopCta
          title="Get original Ghatna Chakra at Shubham Xerox"
          body="Purvavlokan subject sets, MPPSC combos and current affairs — available online and at Bhawarkua Square, Indore."
          primaryTo="/category/ghatna-chakra-books"
          primaryLabel="Shop Ghatna Chakra"
          secondaryTo="/category/mppsc-books"
          secondaryLabel="MPPSC Books"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">7. Frequently Asked Questions</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
