import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, ExtLink, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'why-list', label: 'Why this list matters for 2026' },
  { id: 'top-10', label: 'Top 10 MPPSC books' },
  { id: 'prelims-vs-mains', label: 'Prelims vs Mains split' },
  { id: 'study-plan', label: 'How to use these books' },
  { id: 'combo', label: 'Ready combo at Shubham Xerox' },
  { id: 'faq', label: 'FAQs' },
];

const BOOKS = [
  {
    rank: 1,
    name: 'Ghatna Chakra Purvavlokan (Samanya Adhyayan) — Subject set',
    use: 'History, Geography, Polity, Economy, Environment, Science',
    why: 'Most-recommended PYQ + topic bank for MPPSC/SSC. Use it for concept + previous-year mapping, not as a first-read textbook.',
    link: '/category/ghatna-chakra-books',
  },
  {
    rank: 2,
    name: 'MP Special / Madhya Pradesh GK (Mahaveer / Mukesh Maheshwari style guides)',
    use: 'MPPSC Prelims state-specific section',
    why: 'State GK decides ranks in MPPSC. Keep one dedicated MP book and revise maps, schemes, districts and culture weekly.',
    link: '/category/mppsc-books',
  },
  {
    rank: 3,
    name: 'NCERT Class 6–12 (History, Geography, Polity, Economics — selective)',
    use: 'Foundation for Prelims + Mains',
    why: 'Builds clean basics before coaching notes or advanced guides. Focus on modern history, Indian polity and physical geography first.',
    link: '/shop',
  },
  {
    rank: 4,
    name: 'Indian Polity — M. Laxmikanth',
    use: 'Prelims + Mains GS',
    why: 'Still the gold standard for polity. Pair with current constitutional amendments and MP administrative structure notes.',
    link: '/category/mppsc-books',
  },
  {
    rank: 5,
    name: 'Spectrum — A Brief History of Modern India (Rajiv Ahir)',
    use: 'Modern history',
    why: 'Covers freedom struggle timelines that repeat in Prelims. Make one-page timelines after each chapter.',
    link: '/category/mppsc-books',
  },
  {
    rank: 6,
    name: 'Lucent’s General Knowledge',
    use: 'Quick revision + static GK',
    why: 'Handy for science, awards, sports and mixed static. Do not rely on Lucent alone for deep MPPSC Mains answers.',
    link: '/shop',
  },
  {
    rank: 7,
    name: 'Speedy / monthly Current Affairs + Budget & Economic Survey summaries',
    use: 'Prelims CA + Mains examples',
    why: '2026 pattern rewards fresh schemes and data. Keep last 12 months + MP state budget highlights.',
    link: '/category/current-affairs-books',
  },
  {
    rank: 8,
    name: 'MPPSC Mains GS answer-writing / Hindi guidebook set',
    use: 'Mains (post-optional removal, pure GS)',
    why: 'From 2026, Mains is fully GS-based. Practise structured Hindi answers with introduction–body–conclusion and MP examples.',
    link: '/category/mppsc-mains-books',
  },
  {
    rank: 9,
    name: 'CSAT / Aptitude practice book (quantitative + reasoning + comprehension)',
    use: 'Prelims Paper II (qualifying)',
    why: 'Many serious GS candidates still fail CSAT. Fix maths + comprehension early; do not leave it for the last month.',
    link: '/category/mppsc-books',
  },
  {
    rank: 10,
    name: 'Previous Year Question Papers (Prelims + Mains) with solutions',
    use: 'Pattern mastery',
    why: 'PYQs tell you what MPPSC actually asks. Solve topic-wise after finishing each subject, then full mocks.',
    link: '/category/mppsc-books',
  },
];

const FAQS = [
  {
    q: 'Which are the best books for MPPSC Prelims 2026?',
    a: 'Start with NCERTs + Laxmikanth + Spectrum + MP Special GK + Ghatna Chakra Purvavlokan + 12 months current affairs. Add Lucent for quick static revision and a CSAT practice book.',
  },
  {
    q: 'Do I need different books for MPPSC Mains after the 2026 pattern change?',
    a: 'Yes — optional subjects are removed, so prioritise GS Mains answer-writing guides, enriched notes from Prelims books, and MP-centric examples rather than optional-subject textbooks.',
  },
  {
    q: 'Is Ghatna Chakra enough for MPPSC?',
    a: 'It is excellent for PYQs and topic drilling, but not a complete first textbook. Pair it with NCERT/Laxmikanth/Spectrum and MP GK.',
  },
  {
    q: 'Where can I buy original MPPSC books in Indore?',
    a: 'Shubham Xerox at Bhawarkua Square stocks Ghatna Chakra, MP Special GK, Mains guides, current affairs and stationery, with pan-India delivery from shubhamxerox.in.',
  },
];

export default function MppscTop10({ post, phone, whatsapp }) {
  return (
    <ArticleShell
      post={post}
      phone={phone}
      whatsapp={whatsapp}
      updatedLabel="Updated Oct 2026"
      readTime="~11 min read"
      toc={TOC}
      faqs={FAQS}
      keywords={[
        'best books for MPPSC 2026',
        'MPPSC Prelims books list',
        'MPPSC Mains books 2026',
        'Ghatna Chakra for MPPSC',
        'MP Special GK book',
        'Laxmikanth for MPPSC',
        'MPPSC books Indore',
        'Shubham Xerox MPPSC',
      ]}
      metaTitle="Top 10 Best Books for MPPSC Prelims & Mains 2026"
      metaDescription="Best MPPSC books 2026: Ghatna Chakra, MP Special GK, Laxmikanth, Spectrum, NCERT, current affairs & Mains guides. Buy at Shubham Xerox Indore."
    >
      <section className="mb-12">
        <SectionTitle id="why-list">1. Why this book list matters for MPPSC 2026</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
          MPPSC 2026 changed the game: <strong className="text-slate-900">negative marking in Prelims Paper I</strong> and a{' '}
          <strong className="text-slate-900">fully General-Studies Mains</strong> (optional paper removed). Random coaching PDFs
          waste time — you need a tight, original book stack that covers static, MP-specific GK, current affairs and answer writing.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          Official notifications stay on{' '}
          <ExtLink href="https://mppsc.mp.gov.in/">mppsc.mp.gov.in</ExtLink>. For vacancies and calendar context, read our{' '}
          <Link to="/blogs/mp-government-jobs-2026-guide" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
            MP Government Jobs 2026 guide
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="top-10">2. Top 10 Best Books for MPPSC Prelims &amp; Mains</SectionTitle>
        <div className="space-y-4">
          {BOOKS.map((b) => (
            <article key={b.rank} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="shrink-0 w-9 h-9 rounded-full bg-ink-900 text-white text-sm font-bold flex items-center justify-center">
                  {b.rank}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{b.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mt-1">{b.use}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3 pl-12">{b.why}</p>
              <div className="pl-12">
                <Link to={b.link} className="text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                  Shop related books →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="prelims-vs-mains">3. Prelims vs Mains — how to split your shelf</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-2">Prelims focus</h3>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li>NCERT + Laxmikanth + Spectrum</li>
              <li>MP Special GK + maps</li>
              <li>Ghatna Chakra topic drills</li>
              <li>12-month current affairs</li>
              <li>CSAT practice till you clear comfortably</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-2">Mains focus</h3>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li>Same core books → expand into notes</li>
              <li>Hindi answer-writing practice daily</li>
              <li>MP schemes, districts, economy examples</li>
              <li>Mains PYQs + model answers</li>
              <li>
                Browse{' '}
                <Link to="/category/mppsc-mains-books" className="font-semibold text-brand-600 underline">
                  MPPSC Mains books
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="study-plan">4. How to actually use these books (not just buy them)</SectionTitle>
        <ul className="space-y-3 text-sm text-slate-600">
          {[
            'Finish NCERT backbone in 45–60 days while doing MP GK on weekends.',
            'After each subject, solve Ghatna Chakra / PYQs for that topic the same week.',
            'Current affairs: 45 minutes daily + monthly revision from Speedy/magazine.',
            'From month 4 onward: 1 Mains answer daily in Hindi (200–250 words).',
            'Last 60 days: full mocks + Lucent/MP one-liners + weak-area revision only.',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          Deep-dive on using Ghatna Chakra properly:{' '}
          <Link to="/blogs/ghatna-chakra-purvavlokan-hindi-english" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
            Why Ghatna Chakra Purvavlokan is a must-have
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="combo">5. Ready MPPSC combo at Shubham Xerox</SectionTitle>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          Prefer a shelf that is already curated? Ask for our <strong className="text-slate-900">MPPSC Prelims + Mains combo</strong> —
          Ghatna Chakra set, MP GK, current affairs monthly, Mains answer booklet and rough registers — available in-store and online.
        </p>
        <ShopCta
          title="Buy MPPSC books online or at Bhawarkua"
          body="Original Ghatna Chakra, MP Special GK, Laxmikanth, Spectrum, Speedy CA and Mains guides — with photocopy & notes printing support."
          primaryTo="/category/mppsc-books"
          primaryLabel="Shop MPPSC Books"
          secondaryTo="/category/ghatna-chakra-books"
          secondaryLabel="Ghatna Chakra Series"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">6. Frequently Asked Questions</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
