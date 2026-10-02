import Seo, { breadcrumbSchema } from '../components/ui/Seo';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiUser, FiArrowRight, FiTag } from 'react-icons/fi';
import { BLOG_POSTS } from '../data/blogs';

export default function Blogs() {
  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Exam Guides & Articles' }
  ];

  const keywords = [
    'MP government jobs 2026',
    'MP Police Constable recruitment',
    'MPPSC best books 2026',
    'Shubham Xerox blog',
    'MP Board Pariksha Bodh 2026 PDF',
    'Ghatna Chakra Purvavlokan review',
    'MPPSC Mains answer writing notebook',
    'Indore student study guide'
  ];

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Shubham Xerox Exam Guides & Book Hub',
    description: 'Preparation guides, book recommendations, and study strategies for MPPSC, MPESB, MP Board, SSC and competitive exam aspirants.',
    url: 'https://shubhamxerox.in/blogs',
    publisher: {
      '@type': 'Organization',
      name: 'Shubham Xerox',
      logo: 'https://shubhamxerox.in/logo.png'
    },
    blogPost: BLOG_POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.listingTitle || p.title,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      url: `https://shubhamxerox.in/blogs/${p.id}`,
      author: { '@type': 'Person', name: p.author },
    })),
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Seo
        title="Exam Preparation Guides & Book Recommendations | Shubham Xerox"
        description="Read MP government job guides, MPPSC study book lists, MP Board guidance and stationery tips from Shubham Xerox Indore."
        path="/blogs"
        keywords={keywords}
        schema={[blogSchema, breadcrumbSchema(breadcrumbs)]}
      />

      <div className="bg-gradient-to-r from-ink-950 via-slate-900 to-ink-900 text-white py-14 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <FiBookOpen className="text-brand-400" /> Exam Guides & Study Hub
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Books Guidance & Exam Preparation Articles
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Expert book reviews, vacancy guides, syllabus checklists, and preparation tips for MPPSC, MPESB, MP Board and competitive exam aspirants across Madhya Pradesh.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-md">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <FiCalendar size={12} /> {post.date}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  <Link to={`/blogs/${post.id}`} className="hover:text-brand-600 transition-colors">
                    {post.listingTitle || post.title}
                  </Link>
                </h2>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FiTag size={10} /> {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <FiUser size={12} /> {post.author}
                  </span>
                  <Link to={`/blogs/${post.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
                    {post.fullContent ? 'Read full guide' : 'View article'} <FiArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-brand-600 to-indigo-700 text-white rounded-2xl p-8 text-center shadow-md">
          <h3 className="text-2xl font-bold mb-2">Need Custom Study Material or Xerox Printouts?</h3>
          <p className="text-brand-100 max-w-xl mx-auto text-sm mb-6">
            Get MPPSC notes, test series copies, and books delivered right to your doorstep anywhere in India.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/shop" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-2.5 font-bold text-sm">
              Browse All Books
            </Link>
            <Link to="/store-indore" className="btn bg-brand-900/40 text-white hover:bg-brand-900/60 border border-white/20 px-6 py-2.5 font-semibold text-sm">
              Visit Indore Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
