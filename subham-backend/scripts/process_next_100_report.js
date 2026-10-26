const fs = require('fs');
const path = require('path');

const rawBooks = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'next_100_raw.json'), 'utf8'));

function generateCleanSlug(title, author, publisher, currentSlug, num) {
  let slug = currentSlug.toLowerCase();
  
  // Clean up common clutter patterns
  slug = slug.replace(/-or-/g, '-');
  slug = slug.replace(/\bor\b/g, '');
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');

  // Custom precise overrides for duplicates and specific titles:
  if (num === 38) return 'punekar-mp-police-constable-exam-notes-hindi';
  if (num === 51) return 'punekar-mp-police-constable-solved-papers-2012-2025';
  if (num === 88) return 'champion-square-mppsc-mains-sociology-unit-1-2-hindi';
  if (num === 114) return 'champion-square-mppsc-mains-sociology-unit-3-5-hindi';

  // Noise segments
  const noise = [
    'latest-updated-syllabus-edition-for-mppscxerox',
    'latest-updated-mp-gk-for-mppsc-mpesb-patwari-police-si-jail-prahari-teacher-and-all-mp-competitive-exams-or-hindi-medium-or-paperback',
    'latest-mp-budget-economic-survey-and-200-important-questions',
    'vyakhya-sahit-vastunishth-prashn-sangrah-or-mppsc-prelims-gs-study-material-or-exampedia',
    'fundamentals-and-principles-or-mp-esb-mpesb-patwari-special-or-2350-practice-questions-or-abhyansika-1850-questions-or-hindi-medium-or-sanjay-gupta',
    '10-unit-wise-tests-10-full-length-tests-or-hindi-and-english-medium-or-with-answers-or-mppsc-assistant-professor-preparation',
    'complete-study-material-notes-book-set-unit-1-to-10-hindi-medium',
    'latest-syllabus-based-sociology-notes-study',
    'all-mppsc-exams-and-other-all-mp-exams-2027',
    'for-mppsc-pre-and-mains-all-mp-exams',
    'by-selection-tak-publication'
  ];

  for (const n of noise) {
    if (slug.includes(n)) {
      slug = slug.replace(n, '');
    }
  }

  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');

  if (slug.length > 55) {
    const parts = slug.split('-');
    let trimmed = [];
    let len = 0;
    for (const p of parts) {
      if (['and', 'or', 'for', 'by', 'of', 'in', 'the', 'with', 'to', 'all'].includes(p)) continue;
      if (len + p.length + 1 <= 50) {
        trimmed.push(p);
        len += p.length + 1;
      } else {
        break;
      }
    }
    slug = trimmed.join('-');
  }

  if (slug.length < 15) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 45)
      .replace(/-$/, '');
  }

  return slug;
}

function generateMetaTitle(book) {
  const title = book.title.trim();
  const lang = Array.isArray(book.language) ? book.language.join('/') : (book.language || '');
  const author = book.author ? book.author.trim() : '';

  let clean = title
    .replace(/\|.*$/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length > 42) clean = clean.slice(0, 40).trim() + '...';

  let tag = '';
  if (lang.toLowerCase().includes('hindi')) tag = ' (Hindi)';
  else if (lang.toLowerCase().includes('english')) tag = ' (English)';

  return `${clean}${tag} | Shubham Xerox`;
}

function generateMetaDescription(book) {
  const title = book.title.replace(/\|.*$/g, '').trim();
  const author = book.author && book.author !== 'N/A' ? ` by ${book.author}` : '';
  const cat = book.categoryName || book.subCategoryName || 'competitive exams';

  return `Buy ${title}${author} online at best price from Shubham Xerox Indore. Ideal comprehensive study material for ${cat} with fast delivery.`.slice(0, 155);
}

function generateKeywords(book) {
  const kw = new Set();
  const title = book.title.toLowerCase();

  if (book.author && book.author !== 'N/A') kw.add(`${book.author} notes`);
  if (book.publisher && book.publisher !== 'N/A') kw.add(`${book.publisher} books Indore`);
  if (book.categoryName) kw.add(`${book.categoryName}`);

  if (title.includes('mppsc')) kw.add('MPPSC prelims study material');
  if (title.includes('parikshadham')) kw.add('Parikshadham MP books');
  if (title.includes('aakar')) kw.add('Aakar IAS MPPSC notes');
  if (title.includes('police') || title.includes('constable')) kw.add('MP Police Constable book');
  if (title.includes('patwari')) kw.add('MP Patwari solved papers');
  if (title.includes('current affairs')) kw.add('MP current affairs yearbook 2026');
  if (title.includes('sociology') || title.includes('champion')) kw.add('Champion Square sociology notes');
  if (title.includes('selection tak')) kw.add('Selection Tak MP GK');
  if (title.includes('sharma classes')) kw.add('Satyadhi Sharma MP GK');
  if (title.includes('tathya ban')) kw.add('Tathya Ban MP varshiki');
  if (title.includes('fatman') || title.includes('parmar')) kw.add('Parmar SSC Fatman GK book');

  kw.add('Shubham Xerox Indore');
  return [...kw].slice(0, 5);
}

function generateImageAlt(book, cleanSlug) {
  const title = book.title.replace(/[|\/\\#()]/g, ' ').replace(/\s+/g, ' ').trim();
  const author = book.author && book.author !== 'N/A' ? ` by ${book.author}` : '';
  return `${title.slice(0, 60)}${author} Book Cover Shubham Xerox`.slice(0, 95);
}

const usedSlugs = new Set();

const processed = rawBooks.map((b, idx) => {
  const num = idx + 31;
  let newSlug = generateCleanSlug(b.title, b.author, b.publisher, b.slug, num);
  
  // ensure uniqueness
  if (usedSlugs.has(newSlug)) {
    newSlug = `${newSlug}-${num}`;
  }
  usedSlugs.add(newSlug);

  const metaTitle = generateMetaTitle(b);
  const metaDesc = generateMetaDescription(b);
  const keywords = generateKeywords(b);
  const imageAlt = generateImageAlt(b, newSlug);

  const issues = [];
  if (b.slug.includes('-or-') || b.slug.length > 60) issues.push('अत्यधिक लंबा स्लग और -or- चेन');
  if (!b.seo?.metaTitle || b.seo.metaTitle.includes('PDF')) issues.push('डिफ़ॉल्ट या भ्रामक मेटा टाइटल');
  if (!b.seo?.metaDescription || b.seo.metaDescription.length < 40) issues.push('कमज़ोर मेटा डिस्क्रिप्शन');
  if (!b.images || b.images.length === 0) issues.push('कवर इमेज डेटाबेस में अनुपलब्ध');
  else if (!b.images[0].alt || b.images[0].alt.length < 15) issues.push('इमेज ऑल्ट टैग मिसिंग/अधूरा');

  return {
    num,
    id: b._id,
    originalTitle: b.title,
    currentSlug: b.slug,
    currentUrl: `https://shubhamxerox.in/product/${b.slug}`,
    newSlug,
    newCanonicalUrl: `https://shubhamxerox.in/product/${newSlug}`,
    metaTitle,
    metaDesc,
    keywords,
    imageAlt,
    price: b.finalPrice || b.price,
    mrp: b.mrp || b.price,
    author: b.author || 'N/A',
    publisher: b.publisher || 'N/A',
    category: b.categoryName || b.subCategoryName || 'Exam Books',
    language: Array.isArray(b.language) ? b.language.join(', ') : (b.language || 'Hindi'),
    issues: issues.length ? issues.join(', ') : 'साधारण यूआरएल व मेटाडाटा सुधार आवश्यक',
    hasImages: Boolean(b.images && b.images.length > 0)
  };
});

fs.writeFileSync(path.resolve(__dirname, 'next_100_processed.json'), JSON.stringify(processed, null, 2), 'utf8');
console.log(`Processed all 100 books. Unique slugs: ${usedSlugs.size}`);
