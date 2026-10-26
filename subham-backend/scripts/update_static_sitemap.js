const fs = require('fs');
const path = require('path');

const sitemapPath = path.resolve(__dirname, '../../subham-user/public/sitemap.xml');
let xml = fs.readFileSync(sitemapPath, 'utf8');

const batch2 = [
  { oldSlug: 'ctet-paper-2-social-science-best-notes-updated-edition-by-sachin-choudhary-bilingual', newSlug: 'ctet-paper-2-social-science-sachin-choudhary' },
  { oldSlug: 'drishti-mppsc-prelims-practice-series-book-5-3rd-edition-or-includes-1450-2020-2025-pyqs-hindi-medium', newSlug: 'drishti-ias-mppsc-prelims-science-technology-environment-health-hindi' },
  { oldSlug: 'drishti-mppsc-prelims-practice-series-book-2-3rd-edition-or-includes-3300-2020-2025-pyqs-hindi-medium', newSlug: 'drishti-ias-mppsc-prelims-geography-india-madhya-pradesh-hindi' },
  { oldSlug: 'drishti-mppsc-prelims-practice-series-book-1-3rd-edition-or-includes-3300-2020-2025-pyqs-hindi-medium', newSlug: 'drishti-ias-mppsc-prelims-itihas-sanskriti-sahitya-hindi' },
  { oldSlug: 'edu-teria-current-affairs-mcqs-power-book-june-2025-to-october-2026-hindi-medium-for-all-competitive-exams', newSlug: 'edu-teria-current-affairs-mcqs-power-book-hindi' },
  { oldSlug: 'pw-neet-39-years-physics-chapter-wise-and-topic-wise-solved-papers-2026-1988', newSlug: 'pw-neet-pyq-39-years-physics-2027-english' },
  { oldSlug: 'exampedia-madhya-pradesh-current-affairs-yearbook-2026-hindi-medium-2026-mppsc-pre-mains-mpesb-mpsi-adpo-assistant-profe', newSlug: 'exampedia-mp-current-affairs-yearly-book-2026-hindi' },
  { oldSlug: 'pre-selection-tak-mpgs-2027-general-studies-for-mppsc-and-mpesb-exams-madhya-pradesh-gs-book-latest-edition-by-selection-tak-publication', newSlug: 'selection-tak-mpgs-2027-english-edition-book' },
  { oldSlug: 'geography-marathon-topicwise-solved-pyqs-or-or-for-assistant-professor-net-set-1st-grade-pgt-tgt-gic-gdc-and-lt-grade-exams-or-by-dr-suraj-solanki-or-hindi-medium', newSlug: 'geography-marathon-topicwise-solved-pyqs-suraj-solanki-hindi' },
  { oldSlug: 'madhya-pradesh-general-knowledge-2nd-edition-by-disha-publication-complete-mp-gk-book-for-mppsc', newSlug: 'disha-madhya-pradesh-general-knowledge-2nd-edition' },
  { oldSlug: 'selection-tak-mpgk-4th-edition-madhya-pradesh-selection-tak-2026-mp-gk-2026-all-mppsc-exams-and-other-all-mp-exams-2026', newSlug: 'selection-tak-mpgk-4th-edition-2026-hindi' },
  { oldSlug: 'pratiyogita-ghatna-chakra-madhya-pradesh-current-affairs-2025-26-mp-gk-annual-book-budget-economic-survey-hindi-medium', newSlug: 'pratiyogita-ghatna-chakra-mp-current-affairs-2026-hindi' },
  { oldSlug: 'nirman-ias-mppsc-prelims-unit-7-science-environment-and-health-1400-objective-questions-english-xerox', newSlug: 'nirman-ias-mppsc-prelims-unit-7-science-environment-english' },
  { oldSlug: 'mrunal-s-economy-for-upsc-prelims-2026-27-pcb15-powerhouse-for-prelims-set-of-5-booklets-in-spiral-bound-black-and-white', newSlug: 'mrunals-economy-upsc-prelims-pcb15-set-of-5' },
  { oldSlug: 'drishti-ias-mppsc-prelims-practice-series-book-3-bharat-evam-madhya-pradesh-ki-sanvaidhanik-vyavastha-polity-and-constitution-or-hindi-medium-or-3rd-edition', newSlug: 'drishti-ias-mppsc-prelims-polity-constitution-hindi' },
];

let replaced = 0;
let added = 0;
const nowIso = new Date().toISOString();

for (const b of batch2) {
  const oldUrl = 'https://shubhamxerox.in/product/' + b.oldSlug;
  const newUrl = 'https://shubhamxerox.in/product/' + b.newSlug;
  
  if (xml.includes(oldUrl)) {
    xml = xml.replace(oldUrl, newUrl);
    replaced++;
  } else if (!xml.includes(newUrl)) {
    const node = '  <url><loc>' + newUrl + '</loc><lastmod>' + nowIso + '</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n';
    xml = xml.replace('</urlset>', node + '</urlset>');
    added++;
  }
}

fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log('Sitemap updated: ' + replaced + ' URLs replaced, ' + added + ' URLs added.');
