/**
 * Rich text editor (react-quill) for product and policy descriptions.
 * Output HTML is sanitised server-side against an allow-list before storage.
 */
import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    // No italic: the storefront renders all text upright by design.
    ['bold', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    [{ align: [] }],
    ['clean'],
  ],
  clipboard: { matchVisual: false },
};

const FORMATS = ['header', 'bold', 'underline', 'strike', 'list', 'bullet', 'blockquote', 'link', 'align'];

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write the description…', label, hint }) {
  const modules = useMemo(() => MODULES, []);

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
      />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
