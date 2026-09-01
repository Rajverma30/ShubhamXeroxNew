/** Media library — drag & drop bulk upload, folder filter, copy URL, delete. */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { FiCheck, FiCopy, FiImage, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import api, { toFormData } from '../lib/api';
import { useDebounced, useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { bytes, dateLong, imgUrl, number } from '../lib/format';
import {
  Badge, ConfirmDialog, EmptyState, ErrorBlock, PageHeader, Pagination, SearchInput, Select, Spinner,
} from '../components/Ui';

const FOLDERS = ['products', 'banners', 'categories', 'ebooks', 'misc'];

export default function Media() {
  const qc = useQueryClient();
  const toast = useToast();
  const { params, update, setPage } = useListParams({ limit: 40 });

  const [search, setSearch] = useState(params.search || '');
  const debounced = useDebounced(search, 400);
  const [folder, setFolder] = useState('misc');
  const [confirm, setConfirm] = useState(null);
  const [copied, setCopied] = useState(null);

  const query = { ...params, search: debounced || undefined };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['media', query],
    queryFn: () => api.media(query),
    placeholderData: (prev) => prev,
  });

  const uploadMutation = useMutation({
    mutationFn: (files) => api.uploadMedia(toFormData({ folder, files }, ['files'])),
    onSuccess: (docs) => {
      toast(`${docs.length} file${docs.length > 1 ? 's' : ''} uploaded`);
      qc.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteMedia(id),
    onSuccess: () => { toast('File deleted'); setConfirm(null); qc.invalidateQueries({ queryKey: ['media'] }); },
    onError: (err) => toast(err.message, 'error'),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted.length && uploadMutation.mutate(accepted),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'] },
    maxSize: 8 * 1024 * 1024,
    maxFiles: 20,
  });

  const copyUrl = async (url, id) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    toast('URL copied');
    setTimeout(() => setCopied(null), 1600);
  };

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Media library"
        subtitle={data?.pagination ? `${number(data.pagination.total)} files` : 'Reusable images for products, banners and categories'}
      />

      {/* uploader */}
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <div
          {...getRootProps()}
          className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed px-5 py-6 transition-all duration-200 ${
            isDragActive ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
          }`}
        >
          <input {...getInputProps()} />
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-400">
            {uploadMutation.isPending ? <Spinner size={19} /> : <FiUploadCloud size={20} />}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">
              {uploadMutation.isPending ? 'Uploading…' : 'Drop images here, or click to browse'}
            </p>
            <p className="mt-0.5 text-2xs text-ink-400">Up to 20 files, 8 MB each. Converted to WebP at three sizes automatically.</p>
          </div>
        </div>

        <div>
          <span className="label">Upload to folder</span>
          <Select value={folder} onChange={(e) => setFolder(e.target.value)}>
            {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
        </div>
      </div>

      {/* filters */}
      <div className="mb-4 grid gap-2.5 sm:grid-cols-[1fr_200px]">
        <SearchInput value={search} onChange={(v) => { setSearch(v); update({ search: v }); }} placeholder="Search by filename…" />
        <Select value={params.folder || ''} onChange={(e) => update({ folder: e.target.value })} aria-label="Filter by folder">
          <option value="">All folders</option>
          {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
        </Select>
      </div>

      {error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FiImage} title="No files yet" description="Upload images above to build your library." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((m) => (
            <figure key={m._id} className="group card overflow-hidden">
              <div className="relative aspect-square bg-ink-50">
                <img src={imgUrl(m, 'thumb')} alt={m.alt || m.originalName} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink-950/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button type="button" onClick={() => copyUrl(m.url, m._id)} title="Copy URL" className="btn-icon h-8 w-8 bg-white/90 text-ink-700 hover:bg-white">
                    {copied === m._id ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                  </button>
                  <button type="button" onClick={() => setConfirm(m)} title="Delete" className="btn-icon h-8 w-8 bg-white/90 text-rose-600 hover:bg-white">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <figcaption className="p-2.5">
                <p className="truncate text-2xs font-medium text-ink-800">{m.originalName || m.filename}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-400">
                  <Badge>{m.folder}</Badge>
                  <span>{bytes(m.sizeBytes)}</span>
                </p>
                <p className="mt-0.5 text-[10px] text-ink-300">{dateLong(m.createdAt)}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <Pagination pagination={data?.pagination} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        busy={deleteMutation.isPending}
        title="Delete this file?"
        message={`“${confirm?.originalName || confirm?.filename}” will be removed from the library and from disk. Anywhere it's already referenced will show a broken image.`}
        onConfirm={() => deleteMutation.mutate(confirm._id)}
      />
    </>
  );
}
