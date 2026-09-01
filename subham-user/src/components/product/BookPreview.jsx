/** "Read a sample" modal, using the page images extracted from the PDF. */
import { useEffect, useState } from 'react';
import { FiBookOpen, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import api from '../../lib/api';
import { Modal } from '../ui/Overlay';
import { EmptyState, Spinner } from '../ui/Common';
import { resolveAssetUrl } from '../../lib/format';

export default function BookPreview({ open, onClose, slug, title, ebookAvailable }) {
  const [pages, setPages] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !slug) return undefined;
    let alive = true;
    setLoading(true); setIndex(0);
    api.getPreview(slug)
      .then((res) => {
        if (!alive) return;
        setPages((res.pages || []).map(resolveAssetUrl));
        setPageCount(res.pageCount || 0);
      })
      .catch(() => alive && setPages([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [open, slug]);

  return (
    <Modal open={open} onClose={onClose} title="Read a sample" size="lg">
      <div className="p-5">
        {loading ? (
          <div className="flex h-80 items-center justify-center"><Spinner size={26} className="text-ink-300" /></div>
        ) : pages.length === 0 ? (
          <EmptyState icon={FiBookOpen} title="No preview available"
            description="This title doesn't have a sample yet. The full description and specifications are on the product page." />
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-ink-50">
              <img src={pages[index]} alt={`${title} — sample page ${index + 1}`} className="mx-auto max-h-[62vh] w-auto object-contain" />
              <button type="button" aria-label="Previous page" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="btn-icon absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-ink-700 shadow-soft backdrop-blur hover:bg-white disabled:opacity-30">
                <FiChevronLeft size={18} />
              </button>
              <button type="button" aria-label="Next page" disabled={index >= pages.length - 1} onClick={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
                className="btn-icon absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-ink-700 shadow-soft backdrop-blur hover:bg-white disabled:opacity-30">
                <FiChevronRight size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ink-500">
                Sample page <span className="font-semibold text-ink-900">{index + 1}</span> of {pages.length}
                {pageCount ? ` · full book has ${pageCount} pages` : ''}
              </p>
              <div className="flex gap-1.5">
                {pages.map((p, i) => (
                  <button key={p} type="button" aria-label={`Page ${i + 1}`} onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-ink-900' : 'w-1.5 bg-ink-200 hover:bg-ink-300'}`} />
                ))}
              </div>
            </div>

            {ebookAvailable && (
              <a href={api.ebookUrl(slug)} target="_blank" rel="noreferrer" className="btn-brand mt-4 w-full gap-2">
                <FiDownload size={16} /> Download the full free ebook
              </a>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
