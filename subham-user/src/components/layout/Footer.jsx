/** Footer with dynamic link groups, newsletter form and store details. */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone, FiSend, FiYoutube } from 'react-icons/fi';
import api from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { Logo, Spinner } from '../ui/Common';

const FALLBACK_GROUPS = {
  Shop: [
    { label: 'All products', url: '/shop' },
    { label: 'Exam books', url: '/category/exam-books' },
    { label: 'School books', url: '/category/school-books' },
    { label: 'Stationery', url: '/category/stationery' },
    { label: 'Free ebooks', url: '/ebooks' },
  ],
  Help: [
    { label: 'Track your order', url: '/track' },
    { label: 'Shipping & delivery', url: '/policy/shipping' },
    { label: 'Returns & refunds', url: '/policy/returns' },
    { label: 'Contact us', url: '/contact' },
  ],
  Company: [
    { label: 'About us', url: '/about' },
    { label: 'Privacy policy', url: '/policy/privacy' },
    { label: 'Terms of service', url: '/policy/terms' },
  ],
};

export default function Footer() {
  const { settings, toast } = useStore();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const links = settings?.footerLinks;
    if (!links?.length) return FALLBACK_GROUPS;
    return links.reduce((acc, l) => {
      const key = l.group || 'More';
      (acc[key] = acc[key] || []).push(l);
      return acc;
    }, {});
  }, [settings]);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast('Enter a valid email address', 'error'); return; }
    setBusy(true);
    try {
      const res = await api.subscribe(email, 'footer');
      toast(res?.message || "You're subscribed!");
      setEmail('');
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };

  const social = settings?.social || {};

  return (
    <footer className="relative mt-16 overflow-hidden gradient-ink text-white">
      <div className="container-x relative py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo dark className="h-11 w-11" />
            <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-white/60">
              {settings?.tagline || 'Books, exam guides and stationery'} — serving students, teachers and offices with
              fast delivery across India. No account needed to order.
            </p>

            <form onSubmit={subscribe} className="mt-6 max-w-sm">
              <label htmlFor="footer-newsletter" className="mb-2 block text-2xs font-bold uppercase tracking-wider text-white/50">
                Get new arrivals first
              </label>
              <div className="flex gap-2">
                <input id="footer-newsletter" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/40 focus:bg-white/15" />
                <button type="submit" disabled={busy} aria-label="Subscribe" className="btn bg-white px-5 py-2.5 text-ink-900 hover:bg-white/90 disabled:opacity-60">
                  {busy ? <Spinner size={15} /> : <FiSend size={15} />}
                </button>
              </div>
              <p className="mt-2 text-2xs text-white/40">One email a week. Unsubscribe any time.</p>
            </form>

            <div className="mt-6 flex gap-2">
              {[[social.instagram, FiInstagram, 'Instagram'], [social.facebook, FiFacebook, 'Facebook'], [social.youtube, FiYoutube, 'YouTube']]
                .filter(([url]) => url)
                .map(([url, Icon, label]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label}
                    className="btn-icon border border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white">
                    <Icon size={16} />
                  </a>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:pl-8">
            {Object.entries(groups).map(([group, links]) => (
              <div key={group}>
                <p className="mb-3.5 text-2xs font-bold uppercase tracking-wider text-white/50">{group}</p>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={`${group}-${l.url}-${l.label}`}>
                      <Link to={l.url} className="group inline-flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white">
                        {l.label}
                        <FiArrowRight size={12} className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 sm:col-span-1">
              <p className="mb-3.5 text-2xs font-bold uppercase tracking-wider text-white/50">Visit us</p>
              <ul className="space-y-3 text-sm text-white/70">
                {settings?.address && (
                  <li className="flex gap-2.5"><FiMapPin size={15} className="mt-0.5 shrink-0 text-white/40" /><span className="text-pretty leading-relaxed">{settings.address}</span></li>
                )}
                {settings?.phone && (
                  <li className="flex gap-2.5"><FiPhone size={15} className="mt-0.5 shrink-0 text-white/40" /><a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a></li>
                )}
                {settings?.email && (
                  <li className="flex gap-2.5"><FiMail size={15} className="mt-0.5 shrink-0 text-white/40" /><a href={`mailto:${settings.email}`} className="break-all hover:text-white">{settings.email}</a></li>
                )}
                {settings?.openingHours && <li className="text-white/50">{settings.openingHours}</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-2xs text-white/40">© {new Date().getFullYear()} {settings?.storeName || 'Subham Xerox'}. All rights reserved.</p>
          {settings?.poweredBy?.text && (
            /* Agency attribution. Comes from POWERED_BY_TEXT / POWERED_BY_URL
               in the backend .env, not from the database — so it cannot be
               edited away in the admin panel and survives a reseed. */
            <p className="text-2xs text-white/40">
              {settings.poweredBy.url ? (
                <a href={settings.poweredBy.url} target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-white/60 transition-colors hover:text-white">
                  {settings.poweredBy.text}
                </a>
              ) : (
                <span className="font-semibold text-white/60">{settings.poweredBy.text}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
