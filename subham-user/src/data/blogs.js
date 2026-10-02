/**
 * Shared blog registry — listing cards + post routing.
 * Add a fullContent flag for posts that have a dedicated article page.
 */
export const BLOG_POSTS = [
  {
    id: 'mp-government-jobs-2026-guide',
    title: 'MP Government Jobs 2026: 7,500+ Police Constable Vacancies, Exam Dates & Full Preparation Guide',
    listingTitle: 'MP Government Jobs 2026: Constable, MPPSC, MPESB Vacancies & Prep Guide',
    category: 'MP Sarkari Naukri',
    date: 'October 2026',
    publishedAt: '2026-09-17',
    updatedAt: '2026-10-03',
    author: 'Shubham Xerox Prep Team',
    excerpt:
      'Live MP Police Constable 7,500 posts, MPPSC & MPESB vacancy table, exam dates, salary, syllabus and best books available at Shubham Xerox Indore.',
    tags: ['MP Govt Jobs 2026', 'MP Police Constable', 'MPPSC', 'MPESB', 'Sarkari Naukri'],
    fullContent: true,
  },
  {
    id: 'mppsc-2026-best-books-list',
    title: 'Top 10 Best Books for MPPSC Prelims & Mains Preparation 2026',
    category: 'MPPSC Guides',
    date: 'September 2026',
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-01',
    author: 'Shubham Xerox Prep Team',
    excerpt:
      'Complete checklist of essential books for MPPSC. Includes Ghatna Chakra Purvavlokan, MP Special GK by Mahaveer/Mukesh Maheshwari, and Hindi Mains guidebooks.',
    tags: ['MPPSC Books', 'MPPSC 2026', 'Ghatna Chakra', 'Indore Study Material'],
    fullContent: false,
  },
  {
    id: 'mp-board-pariksha-bodh-vs-adhyayan',
    title: 'MP Board Class 10th & 12th: Pariksha Bodh vs Pariksha Adhyayan — Which is Better?',
    category: 'MP Board School',
    date: 'August 2026',
    publishedAt: '2026-08-15',
    updatedAt: '2026-08-15',
    author: 'Shubham Xerox Team',
    excerpt:
      'Detailed comparison of Yugbodh Pariksha Bodh and Navbodh Pariksha Adhyayan for Class 10th and 12th MP Board 2026 board exams.',
    tags: ['MP Board', 'Pariksha Bodh', 'Class 10th Books', 'Class 12th Books'],
    fullContent: false,
  },
  {
    id: 'ghatna-chakra-purvavlokan-hindi-english',
    title: 'Why Ghatna Chakra Purvavlokan Series is Must-Have for Competitive Exams',
    category: 'Exam Strategy',
    date: 'August 2026',
    publishedAt: '2026-08-01',
    updatedAt: '2026-08-01',
    author: 'Editorial Desk',
    excerpt:
      'How to effectively use Ghatna Chakra Samanya Adhyayan for History, Geography, Polity & Environment for MPPSC, SSC & Railway exams.',
    tags: ['Ghatna Chakra', 'Samanya Adhyayan', 'Competitive Exams'],
    fullContent: false,
  },
  {
    id: 'essential-stationery-for-mppsc-aspirants',
    title: 'Essential Stationery Checklist Every Exam Aspirant in Indore Needs',
    category: 'Stationery & Study Tips',
    date: 'July 2026',
    publishedAt: '2026-07-20',
    updatedAt: '2026-07-20',
    author: 'Shubham Xerox Team',
    excerpt:
      'From pastel highlighters for note-making to spiral rough registers and sticky notes — the ultimate study desk setup.',
    tags: ['Stationery', 'Study Desk', 'Highlighters', 'Spiral Register'],
    fullContent: false,
  },
];

export function getBlogBySlug(slug) {
  return BLOG_POSTS.find((p) => p.id === slug) || null;
}
