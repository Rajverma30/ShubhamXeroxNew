import { Link, useParams } from 'react-router-dom';
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiMapPin,
  FiPhone,
  FiShoppingBag,
  FiTag,
  FiUser,
} from 'react-icons/fi';
import Seo, { breadcrumbSchema } from '../components/ui/Seo';
import { useStore } from '../context/StoreContext';
import { BLOG_POSTS, getBlogBySlug } from '../data/blogs';
import { NotFound } from './Static';

const SITE = (import.meta.env.VITE_SITE_URL || 'https://shubhamxerox.in').replace(/\/$/, '');
const OFFICIAL = {
  mpesb: 'https://esb.mp.gov.in/',
  mppsc: 'https://mppsc.mp.gov.in/',
  mponline: 'https://www.mponline.gov.in/',
};

const TOC = [
  { id: 'latest-vacancies', label: 'Latest MP Government Vacancies' },
  { id: 'police-constable', label: 'MP Police Constable (GD) 2026' },
  { id: 'other-recruitments', label: 'Other MPESB & MPPSC Recruitments' },
  { id: 'exam-pattern', label: 'Exam Pattern & Selection Process' },
  { id: 'salary', label: 'Salary, Pay Scale & Benefits' },
  { id: 'career-growth', label: 'Career Growth After Selection' },
  { id: 'best-books', label: 'Best Books at Shubham Xerox' },
  { id: 'faq', label: 'Frequently Asked Questions' },
];

const FAQS = [
  {
    q: 'What is the last date to apply for MP Police Constable 2026?',
    a: 'The online application window is open from 22 September to 6 October 2026 for 7,500 Constable (GD) posts on esb.mp.gov.in. Always re-check the official advertisement before submitting.',
  },
  {
    q: 'When is the MP Police Constable exam 2026?',
    a: 'The written exam (CBT) is tentatively scheduled from 19 November 2026. Confirm your exact shift and centre on the admit card once released by MPESB.',
  },
  {
    q: 'How many MP government vacancies are open right now?',
    a: 'As of early October 2026, the major live recruitment is MP Police Constable (GD) — 7,500 posts. MPPSC State Service 2026 applications have closed and are in the interview stage; watch for the next notification cycle.',
  },
  {
    q: 'What is the salary of an MP Police Constable?',
    a: 'Pay Level 4 (7th CPC), ₹19,500–₹62,000 pay scale, plus DA, HRA and other allowances as applicable as per Madhya Pradesh government rules.',
  },
  {
    q: 'Where can I get the best books for MP Police Constable and MPPSC preparation in Indore?',
    a: 'Shubham Xerox at Bhawarkua Square, Indore stocks GK, Reasoning, Maths, Hindi/English and post-specific guides for MP government exams, along with previous-year papers, photocopy and printing support for applications.',
  },
  {
    q: 'Is the Nayab Tehsildar 2026 exam open for fresh graduates?',
    a: 'No. The current Nayab Tehsildar notification is a departmental limited exam for eligible serving Patwari/clerical cadre employees only — not open to fresh candidates.',
  },
];

function ExtLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700">
      {children} <FiExternalLink size={12} className="shrink-0 opacity-70" />
    </a>
  );
}

function SectionTitle({ id, children }) {
  return (
    <h2 id={id} className="scroll-mt-28 text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 pt-2">
      {children}
    </h2>
  );
}

function MpGovtJobsArticle({ post, phone, whatsapp }) {
  const tel = phone || whatsapp;
  const telHref = tel ? `tel:${String(tel).replace(/\s+/g, '')}` : null;
  const waHref = whatsapp
    ? `https://wa.me/${String(whatsapp).replace(/\D/g, '')}`
    : null;

  const keywords = [
    'MP government jobs 2026',
    'MP Sarkari Naukri 2026',
    'MP Police Constable vacancy 2026',
    'MPESB Constable GD 7500',
    'MPPSC exam calendar 2026',
    'Nayab Tehsildar recruitment 2026',
    'Patwari vacancy Madhya Pradesh',
    'MP Police Constable syllabus',
    'MP Police Constable salary',
    'best books for MP Police Constable',
    'MPPSC books Indore',
    'MPESB books Shubham Xerox',
    'sarkari naukri Madhya Pradesh',
  ];

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Exam Guides', to: '/blogs' },
    { label: 'MP Government Jobs 2026' },
  ];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description:
      'MP Govt Jobs 2026: MP Police Constable 7,500 posts, MPPSC, MPESB & Patwari vacancy list, exam dates, syllabus & top books. Apply before the deadline!',
    image: `${SITE}/logo.png`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: 'Shubham Xerox' },
    publisher: {
      '@type': 'Organization',
      name: 'Shubham Xerox',
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blogs/${post.id}` },
    keywords: keywords.join(', '),
    about: ['Madhya Pradesh government jobs', 'MP Police Constable', 'MPPSC', 'MPESB'],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Seo
        title="MP Government Jobs 2026: 7,500+ Police Constable Vacancies & Exam Guide"
        description="MP Govt Jobs 2026: MP Police Constable 7,500 posts, MPPSC, MPESB & Patwari vacancy list, exam dates, syllabus & top books. Apply before the deadline!"
        path={`/blogs/${post.id}`}
        type="article"
        keywords={keywords}
        schema={[articleSchema, faqSchema, breadcrumbSchema(breadcrumbs)]}
      />

      {/* Hero */}
      <div className="bg-gradient-to-r from-ink-950 via-slate-900 to-ink-900 text-white py-12 sm:py-14 px-4 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/blogs" className="hover:text-white">Exam Guides</Link>
            <span>/</span>
            <span className="text-slate-300">MP Govt Jobs 2026</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full">
              <FiBookOpen className="text-brand-400" /> MP Sarkari Naukri Guide
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
              <FiClock size={12} /> Updated 3 Oct 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[2.65rem] font-extrabold tracking-tight text-white mb-4 leading-tight text-balance">
            {post.title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-5">
            Complete Madhya Pradesh government job guide for 2026 — live{' '}
            <strong className="text-white">MP Police Constable 7,500 vacancies</strong>, MPPSC &amp; MPESB exam dates,
            salary, syllabus and preparation books you can buy online or pick up at{' '}
            <Link to="/store-indore" className="text-brand-300 font-semibold underline underline-offset-2 hover:text-white">
              Shubham Xerox, Bhawarkua Indore
            </Link>
            .
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5"><FiUser size={13} /> {post.author}</span>
            <span className="inline-flex items-center gap-1.5"><FiCalendar size={13} /> {post.date}</span>
            <span className="inline-flex items-center gap-1.5"><FiTag size={13} /> ~12 min read</span>
          </div>
        </div>
      </div>

      {/* Urgency strip */}
      <div className="bg-amber-50 border-b border-amber-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
          <p className="text-amber-950 font-medium leading-snug">
            <span className="font-bold text-amber-800">Application closing soon:</span>{' '}
            MP Police Constable (GD) form last date is <strong>6 October 2026</strong> — 7,500 posts, lakhs of expected applicants.
          </p>
          <a
            href={OFFICIAL.mpesb}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-3 py-2 rounded-lg"
          >
            Apply on MPESB <FiExternalLink size={12} />
          </a>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Disclaimer */}
        <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 mb-8 leading-relaxed">
          Dates and vacancy numbers move fast. Figures below reflect official MPESB/MPPSC notifications as of{' '}
          <strong>3 October 2026</strong>. Before you apply, re-verify on{' '}
          <ExtLink href={OFFICIAL.mpesb}>esb.mp.gov.in</ExtLink> and{' '}
          <ExtLink href={OFFICIAL.mppsc}>mppsc.mp.gov.in</ExtLink>.
        </p>

        {/* TOC */}
        <nav aria-label="Table of contents" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">On this page</h2>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-brand-700 hover:text-brand-900 font-medium inline-flex gap-2">
                  <span className="text-slate-400 font-normal tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Section 1 — Live vacancies */}
        <section className="mb-12">
          <SectionTitle id="latest-vacancies">1. Latest MP Government Vacancies (Live)</SectionTitle>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
            Below is the currently open Madhya Pradesh government recruitment list. Bookmark this page — we update it when{' '}
            <ExtLink href={OFFICIAL.mpesb}>MPESB</ExtLink> or <ExtLink href={OFFICIAL.mppsc}>MPPSC</ExtLink> drop new notifications.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm mb-6">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-slate-900 text-white text-left">
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Vacancies</th>
                  <th className="px-4 py-3 font-semibold">Last Date</th>
                  <th className="px-4 py-3 font-semibold">Exam</th>
                  <th className="px-4 py-3 font-semibold">Apply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-emerald-50/60">
                  <td className="px-4 py-3">MPESB (Police / Home)</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <a href="#police-constable" className="text-brand-700 hover:underline">Constable (GD) — SAF &amp; Non-SAF</a>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-800">7,500</td>
                  <td className="px-4 py-3 font-semibold text-rose-700">6 Oct 2026</td>
                  <td className="px-4 py-3">19 Nov 2026 (CBT, tentative)</td>
                  <td className="px-4 py-3">
                    <a href={OFFICIAL.mpesb} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-semibold hover:underline">esb.mp.gov.in</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">MPESB (Revenue)</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Nayab Tehsildar — Departmental Limited
                    <span className="block text-[11px] font-normal text-amber-700 mt-0.5">Internal employees only</span>
                  </td>
                  <td className="px-4 py-3">73</td>
                  <td className="px-4 py-3">1 Oct 2026</td>
                  <td className="px-4 py-3">From 14 Nov 2026</td>
                  <td className="px-4 py-3">
                    <a href={OFFICIAL.mpesb} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-semibold hover:underline">esb.mp.gov.in</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-600 leading-relaxed">
            <h3 className="font-bold text-slate-900 mb-2">Application fee (typical MPESB pattern)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>General / Unreserved: <strong>₹500</strong></li>
              <li>SC / ST / OBC / EWS / PwBD / MP-domicile: <strong>₹250</strong></li>
              <li>MP Online portal: ₹60 (kiosk) / ₹20 (self-registered) — confirm on the specific notification</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Fee slabs can vary by advertisement. Always match the official PDF on{' '}
              <ExtLink href={OFFICIAL.mponline}>mponline.gov.in</ExtLink> / MPESB before payment.
            </p>
          </div>
        </section>

        {/* Section 2 — Constable deep dive */}
        <section className="mb-12">
          <SectionTitle id="police-constable">2. MP Police Constable (GD) 2026 — Full Details</SectionTitle>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
            Advertisement No. <strong>583/2026</strong> (9 Sep 2026) notified <strong>7,500 Constable (General Duty)</strong> posts —
            700 SAF (male only) and 6,800 Non-SAF (male + female). Apply online between{' '}
            <strong>22 September and 6 October 2026</strong>.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              ['Vacancies', '7,500 (700 SAF + 6,800 Non-SAF)'],
              ['Age limit', '18–33 (male, UR); up to 38 for women / SC / ST / OBC'],
              ['Apply window', '22 Sep 2026 – 6 Oct 2026'],
              ['Written exam', '19 Nov 2026 (CBT, tentative)'],
              ['Official portal', 'esb.mp.gov.in'],
              ['Selection', 'CBT → PET/PMT → Documents & Medical'],
            ].map(([k, v]) => (
              <div key={k} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">{k}</p>
                <p className="text-sm font-semibold text-slate-900">{v}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Start preparation with a focused book combo — GK, Reasoning, Maths, Hindi and previous-year papers.
            Browse our{' '}
            <Link to="/category/mpesb-books" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
              MPESB &amp; Vyapam books
            </Link>{' '}
            and{' '}
            <Link to="/shop" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
              full exam book shop
            </Link>
            .
          </p>
        </section>

        {/* Section 3 — Other recruitments */}
        <section className="mb-12">
          <SectionTitle id="other-recruitments">3. Other Active &amp; Recently Concluded Recruitments</SectionTitle>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
            These windows are closed or mid-process — useful if you are checking status, planning the next cycle, or searching for related posts.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-700">
                  <th className="px-4 py-3 font-semibold">Board</th>
                  <th className="px-4 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Vacancies</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-3">MPPSC</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    State Service (Rajya Seva) 2026 — Dy. Collector, DSP, CMO, CTO, Naib Tehsildar &amp; more
                  </td>
                  <td className="px-4 py-3">155 (+ ~36 Forest ≈ 191)</td>
                  <td className="px-4 py-3">Prelims 26 Apr; Mains 7–12 Sep 2026; interview pending</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">MPESB</td>
                  <td className="px-4 py-3 font-medium text-slate-900">Patwari / Group-2 Sub-Group-4 CRT</td>
                  <td className="px-4 py-3">Confirm on official PDF</td>
                  <td className="px-4 py-3">Applied 4–18 Aug 2026 — check result schedule</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">MPESB</td>
                  <td className="px-4 py-3 font-medium text-slate-900">Nursing Officer &amp; Sister Tutor (Group-5)</td>
                  <td className="px-4 py-3">~2,099–2,317</td>
                  <td className="px-4 py-3">Exam from 15 May 2026</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">MPESB</td>
                  <td className="px-4 py-3 font-medium text-slate-900">Police ASI &amp; Head Constable (computer/IT)</td>
                  <td className="px-4 py-3">89</td>
                  <td className="px-4 py-3">Exam held 24 Mar 2026</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">MPESB</td>
                  <td className="px-4 py-3 font-medium text-slate-900">Subedar &amp; Sub-Inspector (Phase 2)</td>
                  <td className="px-4 py-3">~500</td>
                  <td className="px-4 py-3">Phase-2 exam 26 Apr 2026</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">MPESB</td>
                  <td className="px-4 py-3 font-medium text-slate-900">Pharmacist Grade-II &amp; Paramedical</td>
                  <td className="px-4 py-3">190</td>
                  <td className="px-4 py-3">Exam held 15 Apr 2026</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">MPESB</td>
                  <td className="px-4 py-3 font-medium text-slate-900">Constable (Band)</td>
                  <td className="px-4 py-3">679</td>
                  <td className="px-4 py-3">Applied Apr 2026 — confirm exam date on PDF</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 — Exam pattern */}
        <section className="mb-12">
          <SectionTitle id="exam-pattern">4. Exam Pattern &amp; Selection Process</SectionTitle>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">MP Police Constable (GD) 2026</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Written Exam (CBT) — 100 marks:</strong> Objective MCQs covering
                  General Knowledge &amp; Current Affairs, General Hindi, General English, General Science, General Mathematics,
                  Reasoning &amp; Mental Ability.
                </li>
                <li>
                  <strong className="text-slate-900">PET &amp; PMT — 100 marks:</strong> Running, height/chest measurement
                  as per category and gender.
                </li>
                <li>
                  <strong className="text-slate-900">Document Verification &amp; Medical Examination.</strong>
                </li>
              </ol>
              <p className="mt-3 text-xs text-slate-500">
                Final merit typically combines written + PET/PMT — confirm exact weightage on the official rulebook before treating any split as final.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Nayab Tehsildar Departmental Exam 2026</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Two objective papers of 100 marks each (200 total), 2 hours per paper, bilingual (Hindi/English).
                Open only to eligible serving departmental employees — not a fresh-candidate exam.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">MPPSC State Service (typical 3-stage pattern)</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Prelims:</strong> GS Paper + CSAT (qualifying). 2026 cycle introduced{' '}
                  <strong>negative marking in Paper I</strong> (1 mark per wrong answer).
                </li>
                <li>
                  <strong className="text-slate-900">Mains:</strong> Fully General Studies based from 2026 — optional subject paper removed.
                </li>
                <li>
                  <strong className="text-slate-900">Interview:</strong> 175 marks, part of final merit with Mains.
                </li>
              </ul>
              <p className="mt-3 text-sm text-slate-600">
                Recommended reading list:{' '}
                <Link to="/blogs/mppsc-2026-best-books-list" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
                  Top 10 MPPSC books for Prelims &amp; Mains 2026
                </Link>
                {' '}·{' '}
                <Link to="/category/mppsc-books" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
                  Shop MPPSC books
                </Link>
                {' '}·{' '}
                <Link to="/category/mppsc-mains-books" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
                  MPPSC Mains books
                </Link>
              </p>
            </div>

            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed">
              <strong>Negative marking note:</strong> Rules differ post-to-post. Some MPESB Group exams have no negative marking;
              MPPSC Prelims Paper I now does. Never assume a blanket rule — check each official notification.
            </p>
          </div>
        </section>

        {/* Section 5 — Salary */}
        <section className="mb-12">
          <SectionTitle id="salary">5. Salary, Pay Scale &amp; In-Hand Benefits</SectionTitle>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm mb-5">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-slate-900 text-white text-left">
                  <th className="px-4 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Pay Level / Scale</th>
                  <th className="px-4 py-3 font-semibold">Approx. Starting Basic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Constable (GD)</td>
                  <td className="px-4 py-3">₹19,500 – ₹62,000 (Level 4, 7th CPC)</td>
                  <td className="px-4 py-3">~₹19,500 + DA/HRA</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Head Constable</td>
                  <td className="px-4 py-3">₹25,300 – ₹80,500</td>
                  <td className="px-4 py-3">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">ASI</td>
                  <td className="px-4 py-3">₹28,700 – ₹91,300</td>
                  <td className="px-4 py-3">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Nayab Tehsildar</td>
                  <td className="px-4 py-3">Level 9 (7th CPC)</td>
                  <td className="px-4 py-3">₹36,200 basic + allowances</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Deputy Collector / DSP</td>
                  <td className="px-4 py-3" colSpan={2}>Group A/B state scales — confirm exact level on MPPSC notification</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            <strong className="text-slate-900">In-hand pay</strong> = Basic + DA + HRA (higher in Bhopal/Indore) + Transport Allowance,
            minus NPS/pension contribution and professional tax. Exact figures vary by posting city and current DA rate.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Common benefits: medical coverage, NPS contribution, paid leave, LTC, job security, and eligibility for quarters/HRA
            depending on posting.
          </p>
        </section>

        {/* Section 6 — Career */}
        <section className="mb-12">
          <SectionTitle id="career-growth">6. Career Growth After Selection</SectionTitle>
          <ul className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <li className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong className="text-slate-900">Police track:</strong> Constable → Head Constable → ASI → Sub-Inspector → Inspector
                via seniority and departmental exams (Subedar/SI cycles on MPESB).
              </span>
            </li>
            <li className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong className="text-slate-900">Revenue track:</strong> Patwari → Revenue Inspector → Nayab Tehsildar
                (departmental limited exam) → Tehsildar → Deputy Collector.
              </span>
            </li>
            <li className="flex gap-2">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong className="text-slate-900">Pension:</strong> NPS lump-sum + annuity on retirement, plus gratuity and leave encashment as per state rules.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 7 — Books CTA */}
        <section className="mb-12">
          <SectionTitle id="best-books">7. Best Books for MP Govt Exam Preparation (Available at Shubham Xerox)</SectionTitle>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
            Stocked at our{' '}
            <Link to="/store-indore" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
              Bhawarkua Indore store
            </Link>{' '}
            and available for{' '}
            <Link to="/shop" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
              pan-India delivery
            </Link>
            . Pair these with{' '}
            <Link to="/category/current-affairs-books" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
              current affairs
            </Link>{' '}
            and{' '}
            <Link to="/category/ghatna-chakra-books" className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2">
              Ghatna Chakra series
            </Link>
            .
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-2">General Knowledge &amp; Current Affairs</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                <li>MP GK / MP Samanya Gyan — Constable, Patwari, Nayab Tehsildar, MPPSC Prelims</li>
                <li>Lucent&apos;s General Knowledge — all MPESB Group exams &amp; MPPSC</li>
                <li>Ghatna Chakra Purvavlokan / Speedy Current Affairs monthly</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-2">Mathematics &amp; Reasoning</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                <li>R.S. Aggarwal Quantitative Aptitude — Constable, Patwari, Group-C</li>
                <li>Verbal &amp; Non-Verbal Reasoning — all objective MPESB papers</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-2">Hindi, English &amp; Computer</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                <li>MP Board-aligned Hindi Vyakaran — Constable &amp; Patwari</li>
                <li>General English for Competitive Exams — MPPSC, ASI/HC, Nayab Tehsildar</li>
                <li>Computer Awareness — ASI/HC (IT) &amp; departmental computer tests</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-2">Subject / Combo Kits</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                <li>MP Police Constable Complete Combo — GK + Reasoning + Maths + PYQs</li>
                <li>MPPSC Prelims + Mains Combo — GS + current affairs + answer writing</li>
                <li>MP Group-C Combo — shared syllabus for Patwari / Clerk / related posts</li>
                <li>MP Police PET/PMT fitness guide for physical stage</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-brand-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Get your MP exam books before the rush</h3>
            <p className="text-brand-100 text-sm max-w-2xl mb-5 leading-relaxed">
              Previous-year papers, admit-card printouts, form photocopies and full book combos — online delivery across India
              or walk-in at Bhawarkua Square, Indore.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/category/mpesb-books" className="btn bg-white text-brand-700 hover:bg-brand-50 px-5 py-2.5 font-bold text-sm">
                <FiShoppingBag className="mr-1" /> MPESB Books
              </Link>
              <Link to="/category/mppsc-books" className="btn bg-brand-900/40 text-white hover:bg-brand-900/60 border border-white/20 px-5 py-2.5 font-semibold text-sm">
                MPPSC Books
              </Link>
              <Link to="/stationery" className="btn bg-brand-900/40 text-white hover:bg-brand-900/60 border border-white/20 px-5 py-2.5 font-semibold text-sm">
                Stationery
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <SectionTitle id="faq">8. Frequently Asked Questions</SectionTitle>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-white rounded-2xl border border-slate-200 open:shadow-sm">
                <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900 text-sm sm:text-base flex items-start justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-brand-600 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Official sources */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Official sources to bookmark</h2>
          <ul className="grid sm:grid-cols-3 gap-3 text-sm">
            {[
              ['MPESB / Vyapam', OFFICIAL.mpesb],
              ['MPPSC', OFFICIAL.mppsc],
              ['MP Online', OFFICIAL.mponline],
            ].map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 hover:border-brand-300 hover:text-brand-700"
                >
                  {label} <FiExternalLink size={14} className="text-slate-400" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA */}
        <section className="bg-ink-950 text-white rounded-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-2xl font-bold mb-2">Ready to start your MP Government job preparation?</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-5 max-w-2xl">
            Don&apos;t wait for the last date to panic-buy books. Get MP Police Constable, MPPSC and Patwari preparation sets,
            previous-year papers, and application printing — all at Shubham Xerox.
          </p>
          <ul className="space-y-2 text-sm text-slate-300 mb-6">
            <li className="flex items-start gap-2">
              <FiMapPin className="text-brand-400 mt-0.5 shrink-0" />
              <span>
                Near Bhawarkua Square, Main Road, Indore, MP 452001 —{' '}
                <Link to="/store-indore" className="text-brand-300 font-semibold underline underline-offset-2 hover:text-white">
                  store details &amp; map
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FiClock className="text-brand-400 mt-0.5 shrink-0" />
              <span>Mon–Sat 9:00 AM – 9:30 PM · Sunday 10:00 AM – 7:00 PM</span>
            </li>
            {tel && (
              <li className="flex items-start gap-2">
                <FiPhone className="text-brand-400 mt-0.5 shrink-0" />
                <span>
                  {telHref ? <a href={telHref} className="text-brand-300 font-semibold hover:text-white">{tel}</a> : tel}
                  {waHref && (
                    <>
                      {' · '}
                      <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-brand-300 font-semibold hover:text-white">
                        WhatsApp
                      </a>
                    </>
                  )}
                </span>
              </li>
            )}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className="btn bg-white text-ink-900 hover:bg-brand-50 px-5 py-2.5 font-bold text-sm">
              Order Books Online <FiArrowRight />
            </Link>
            <Link to="/contact" className="btn border border-white/25 text-white hover:bg-white/10 px-5 py-2.5 font-semibold text-sm">
              Contact Us
            </Link>
          </div>
        </section>

        {/* Related posts */}
        <aside className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Related guides</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to={`/blogs/${p.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1">{p.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-snug">{p.listingTitle || p.title}</p>
              </Link>
            ))}
          </div>
        </aside>
      </article>
    </div>
  );
}

function ComingSoonPost({ post }) {
  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Exam Guides', to: '/blogs' },
    { label: post.title },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blogs/${post.id}`}
        type="article"
        keywords={post.tags}
        schema={breadcrumbSchema(breadcrumbs)}
      />
      <div className="bg-gradient-to-r from-ink-950 via-slate-900 to-ink-900 text-white py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <FiBookOpen /> {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">{post.title}</h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{post.excerpt}</p>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 mt-10 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Full article is being finalised. Meanwhile, explore our live{' '}
            <Link to="/blogs/mp-government-jobs-2026-guide" className="font-semibold text-brand-600 underline">
              MP Government Jobs 2026 guide
            </Link>{' '}
            or shop exam books online.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-primary text-sm px-5 py-2.5">Browse Books</Link>
            <Link to="/blogs" className="btn-secondary text-sm px-5 py-2.5">All Guides</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const { settings } = useStore();
  const post = getBlogBySlug(slug);

  if (!post) return <NotFound />;

  if (post.id === 'mp-government-jobs-2026-guide' && post.fullContent) {
    return (
      <MpGovtJobsArticle
        post={post}
        phone={settings?.phone}
        whatsapp={settings?.whatsapp || settings?.phone}
      />
    );
  }

  return <ComingSoonPost post={post} />;
}
