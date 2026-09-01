/** Full-width newsletter capture. */
import { useState } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import api from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { Spinner } from '../ui/Common';

export default function NewsletterBlock({ title, subtitle }) {
  const { toast } = useStore();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast('Enter a valid email address', 'error'); return; }
    setBusy(true);
    try {
      const res = await api.subscribe(email, 'homepage');
      toast(res?.message || "You're subscribed!");
      setDone(true); setEmail('');
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="relative overflow-hidden rounded-4xl gradient-ink px-6 py-12 text-center text-white sm:px-12 sm:py-16">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold-400/15 blur-3xl" />
      <div className="relative mx-auto max-w-xl">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-md"><FiMail size={20} /></span>
        <h2 className="text-balance font-display text-2xl font-bold sm:text-3xl">{title || 'Get new arrivals first'}</h2>
        <p className="mx-auto mt-2.5 max-w-md text-pretty text-sm text-white/65">
          {subtitle || 'One email a week with new titles, restocks and offers. No spam, ever.'}
        </p>
        {done ? (
          <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-5 py-3 text-sm font-semibold text-emerald-200">
            You're on the list — watch your inbox.
          </p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-7 flex max-w-md flex-col gap-2.5 sm:flex-row">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email address"
              className="flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/40 focus:bg-white/15" />
            <button type="submit" disabled={busy} className="btn bg-white px-6 py-3.5 text-ink-900 hover:bg-white/90 disabled:opacity-60">
              {busy ? <Spinner size={15} /> : <><FiSend size={15} /> Subscribe</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
