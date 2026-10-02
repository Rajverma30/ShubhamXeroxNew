import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { ArticleShell, FaqBlock, SectionTitle, ShopCta } from './shared';

const TOC = [
  { id: 'why-stationery', label: 'Why stationery matters' },
  { id: 'checklist', label: 'Complete checklist' },
  { id: 'desk-setup', label: 'Ideal Indore study desk' },
  { id: 'exam-day', label: 'Exam-day pouch' },
  { id: 'faq', label: 'FAQs' },
];

const GROUPS = [
  {
    title: 'Writing & pens',
    items: ['2–3 smooth blue/black gel pens (exam-safe)', 'Pencil + sharpener + eraser', 'Correction tape (not messy whitener for notes)', 'Fine liner for diagrams'],
  },
  {
    title: 'Notebooks & paper',
    items: ['Spiral rough register for mocks', 'Subject-wise A4 notebooks', 'Graph / practical sheets if needed', 'Sticky notes for revision tags'],
  },
  {
    title: 'Highlight & organise',
    items: ['Pastel highlighters (3–4 colours max)', 'Index tabs / sticky flags', 'Folder or clear bag for admit card prints', 'Binder clips for PYQ sets'],
  },
  {
    title: 'Desk & comfort',
    items: ['Stable study lamp', 'Desk organiser / pen stand', 'Water bottle on desk', 'Wall calendar for weekly targets'],
  },
];

const FAQS = [
  {
    q: 'What stationery do MPPSC aspirants need most?',
    a: 'A rough spiral for mocks, subject notebooks, pastel highlighters, sticky flags, reliable pens and a folder for printed syllabi/admit cards. Fancy kits are optional — consistency is not.',
  },
  {
    q: 'Where can I buy exam stationery in Bhawarkua Indore?',
    a: 'Shubham Xerox stocks highlighters, spirals, registers, files and pens alongside exam books — ideal one-stop pickup near Bhawarkua Square.',
  },
];

export default function StationeryChecklist({ post, phone, whatsapp }) {
  return (
    <ArticleShell
      post={post}
      phone={phone}
      whatsapp={whatsapp}
      updatedLabel="Updated Jul 2026"
      readTime="~7 min read"
      toc={TOC}
      faqs={FAQS}
      keywords={[
        'stationery for MPPSC',
        'study desk setup Indore',
        'best highlighters for notes',
        'spiral register for mocks',
        'exam stationery Bhawarkua',
        'Shubham Xerox stationery',
      ]}
      metaTitle="Essential Stationery Checklist for Exam Aspirants in Indore"
      metaDescription="Complete stationery checklist for MPPSC & board aspirants in Indore — highlighters, spirals, pens, desk setup. Buy at Shubham Xerox Bhawarkua."
    >
      <section className="mb-12">
        <SectionTitle id="why-stationery">1. Why stationery quietly decides ranks</SectionTitle>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Books get the attention; stationery decides whether you actually revise. Aspirants who keep a fixed rough register for
          mocks, colour-coded flags for weak topics and a clean print folder for forms waste less time hunting pens the night
          before CBT. This checklist is what we recommend daily at{' '}
          <Link to="/store-indore" className="font-semibold text-brand-600 underline">
            Shubham Xerox, Bhawarkua
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="checklist">2. Complete checklist</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {GROUPS.map((g) => (
            <div key={g.title} className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-3">{g.title}</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <SectionTitle id="desk-setup">3. Ideal Indore study-desk setup</SectionTitle>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 leading-relaxed mb-4">
          <li>One subject notebook open + one rough spiral only (avoid 6 half-used pads).</li>
          <li>Max 4 highlighter colours — eg. yellow definition, pink date, green scheme, blue weak topic.</li>
          <li>Keep admit-card / form printouts in one labelled envelope (we print these in-store).</li>
          <li>Phone outside arm’s reach during deep-work blocks.</li>
        </ol>
        <p className="text-sm text-slate-600">
          Building an MPPSC shelf? Start here:{' '}
          <Link to="/blogs/mppsc-2026-best-books-list" className="font-semibold text-brand-600 underline">
            Top 10 MPPSC books 2026
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle id="exam-day">4. Exam-day pouch (pack the night before)</SectionTitle>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 mb-4">
          <li>Admit card print + photo ID</li>
          <li>2 pens + 1 pencil + eraser</li>
          <li>Transparent pouch (follow centre rules)</li>
          <li>Water bottle if allowed; avoid heavy snacks</li>
        </ul>
        <ShopCta
          title="Grab stationery with your exam books"
          body="Highlighters, spiral registers, files, pens and printouts — same counter as MPPSC & MP Board books at Bhawarkua."
          primaryTo="/stationery"
          primaryLabel="Shop Stationery"
          secondaryTo="/shop"
          secondaryLabel="All Products"
        />
      </section>

      <section className="mb-12">
        <SectionTitle id="faq">5. Frequently Asked Questions</SectionTitle>
        <FaqBlock faqs={FAQS} />
      </section>
    </ArticleShell>
  );
}
