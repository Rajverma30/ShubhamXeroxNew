/**
 * Drag & drop image uploader.
 *
 * Shows previews of newly-selected files plus any already-saved images, and
 * lets the admin remove either. Removals of saved images are reported through
 * `onRemoveExisting` so the parent can send a `keepImages` list to the API.
 */
import { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiFile, FiImage, FiUploadCloud, FiX } from 'react-icons/fi';
import { bytes, imgUrl } from '../lib/format';

export default function ImageDropzone({
  files = [],
  onChange,
  existing = [],
  onRemoveExisting,
  maxFiles = 12,
  label = 'Product images',
  hint = 'PNG, JPG, WebP or AVIF up to 8 MB each. The first image is used as the cover.',
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'] },
}) {
  const onDrop = useCallback(
    (accepted) => {
      const next = [...files, ...accepted].slice(0, maxFiles);
      onChange(next);
    },
    [files, maxFiles, onChange],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: 8 * 1024 * 1024,
  });

  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) })),
    [files],
  );

  const removeNew = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <span className="label">{label}</span>

      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-all duration-200 ${
          isDragActive ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-ink-50/60 hover:border-ink-300 hover:bg-ink-50'
        }`}
      >
        <input {...getInputProps()} />
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-ink-400 shadow-soft">
          <FiUploadCloud size={20} />
        </span>
        <p className="text-sm font-semibold text-ink-800">
          {isDragActive ? 'Drop the images here' : 'Drag images here, or click to browse'}
        </p>
        <p className="mt-1 text-2xs text-ink-400">{hint}</p>
      </div>

      {fileRejections.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-2xs text-rose-600">
          {fileRejections.map(({ file, errors }) => (
            <li key={file.name}>{file.name}: {errors[0]?.message}</li>
          ))}
        </ul>
      )}

      {/* already-saved images */}
      {existing.length > 0 && (
        <>
          <p className="mt-4 text-2xs font-bold uppercase tracking-wide text-ink-400">
            Saved images ({existing.length})
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-6">
            {existing.map((img, i) => (
              <div key={img.url || i} className="group relative overflow-hidden rounded-xl border border-ink-100">
                <img src={imgUrl(img, 'thumb')} alt={img.alt || ''} className="aspect-[3/4] w-full object-cover" />
                {img.source === 'pdf' && (
                  <span className="absolute bottom-1 left-1 rounded bg-ink-950/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    from PDF
                  </span>
                )}
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(img.url)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-600 opacity-0 transition-opacity hover:bg-rose-500 hover:text-white group-hover:opacity-100"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* newly selected */}
      {previews.length > 0 && (
        <>
          <p className="mt-4 text-2xs font-bold uppercase tracking-wide text-brand-600">
            New uploads ({previews.length})
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-6">
            {previews.map((p, i) => (
              <div key={`${p.name}-${i}`} className="group relative overflow-hidden rounded-xl border-2 border-brand-200">
                <img src={p.url} alt="" className="aspect-[3/4] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  aria-label={`Remove ${p.name}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-600 transition-colors hover:bg-rose-500 hover:text-white"
                >
                  <FiX size={12} />
                </button>
                <span className="absolute inset-x-0 bottom-0 truncate bg-ink-950/70 px-1.5 py-0.5 text-[9px] text-white">
                  {bytes(p.size)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {existing.length === 0 && previews.length === 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-2xs leading-relaxed text-amber-800">
          <FiImage size={13} className="mt-0.5 shrink-0" />
          No images yet. If you attach a PDF below, the first 5 pages will be converted into images automatically and
          used as the gallery.
        </p>
      )}
    </div>
  );
}

/** Single-file dropzone used for PDFs and one-off images (banners, icons). */
export function FileDropzone({ file, onChange, label, hint, accept, existingUrl, icon: Icon = FiFile }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => onChange(accepted[0] || null),
    accept,
    maxFiles: 1,
    maxSize: 60 * 1024 * 1024,
  });

  return (
    <div>
      <span className="label">{label}</span>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-4 transition-all duration-200 ${
          isDragActive ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-ink-50/60 hover:border-ink-300'
        }`}
      >
        <input {...getInputProps()} />
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink-400 shadow-soft">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          {file ? (
            <>
              <p className="truncate text-sm font-semibold text-ink-900">{file.name}</p>
              <p className="text-2xs text-ink-400">{bytes(file.size)} · click to replace</p>
            </>
          ) : existingUrl ? (
            <>
              <p className="truncate text-sm font-semibold text-emerald-700">File attached</p>
              <a
                href={existingUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-2xs text-brand-600 underline"
              >
                Open current file
              </a>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink-800">Drop a file or click to browse</p>
              {hint && <p className="text-2xs text-ink-400">{hint}</p>}
            </>
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            aria-label="Remove file"
            className="btn-icon shrink-0 text-ink-400 hover:bg-rose-50 hover:text-rose-500"
          >
            <FiX size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
