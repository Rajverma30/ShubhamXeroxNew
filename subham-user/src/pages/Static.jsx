/** About, Contact, Policy and 404. */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiAlertTriangle, FiClock, FiHome, FiMail, FiMapPin, FiPhone, FiSearch, FiSend } from 'react-icons/fi';
import api from '../lib/api';
import { useStore } from '../context/StoreContext';
import Seo from '../components/ui/Seo';
import { Breadcrumbs, EmptyState, SectionHeader, Spinner, TrustStrip } from '../components/ui/Common';

export function About() {
  const { settings } = useStore();
  return (
    <>
      <Seo title="About us" description="Subham Xerox has served students, teachers and offices for over a decade." path="/about" />
      <div className="container-x max-w-4xl py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} className="mb-5" />
        <SectionHeader eyebrow="Our story" title={`About ${settings?.storeName || 'Subham Xerox'}`} />
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          {settings?.policies?.about
            // eslint-disable-next-line react/no-danger
            ? <div className="prose-store" dangerouslySetInnerHTML={{ __html: settings.policies.about }} />
            : (
              <div className="prose-store">
                <p>What began as a neighbourhood photocopy shop is now a full book store — exam guides, school textbooks, free ebooks and stationery, shipped across India.</p>
                <p>We stock what students actually need, keep editions current, and dispatch within a day. No accounts, no passwords: add to cart, enter your address, done.</p>
              </div>
            )}
        </div>
        <div className="mt-6">
          <TrustStrip items={[
            { icon: FiClock, title: 'A decade of service', description: 'Trusted by students, teachers and offices across Odisha and beyond.' },
            { icon: FiMapPin, title: 'Nationwide delivery', description: 'We deliver to almost every PIN code in India.' },
            { icon: FiMail, title: 'Real people replying', description: 'Email or call us and you get an actual answer, usually same day.' },
            { icon: FiSearch, title: 'Hard-to-find titles', description: "Can't find a book? Ask us — we source titles on request." },
          ]} />
        </div>
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}

export function Contact() {
  const { settings, toast } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 5) {
      toast('Please fill in your name, a valid email and a message', 'error'); return;
    }
    setBusy(true);
    try {
      const res = await api.contact(form);
      toast(res?.message || "Thanks — we'll be in touch.");
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <Seo title="Contact us" description="Get in touch with Subham Xerox." path="/contact" />
      <div className="container-x max-w-5xl py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} className="mb-5" />
        <SectionHeader eyebrow="Say hello" title="Get in touch"
          subtitle="Questions about an order, a title we don't list, or a bulk enquiry — we're happy to help." />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={submit} className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            {sent && (
              <p className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Message received — we'll reply to your email shortly.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="ct-name" className="label">Your name *</label>
                <input id="ct-name" value={form.name} onChange={set('name')} className="field" required /></div>
              <div><label htmlFor="ct-email" className="label">Email *</label>
                <input id="ct-email" type="email" value={form.email} onChange={set('email')} className="field" required /></div>
              <div><label htmlFor="ct-phone" className="label">Phone</label>
                <input id="ct-phone" value={form.phone} onChange={set('phone')} className="field" /></div>
              <div><label htmlFor="ct-subject" className="label">Subject</label>
                <input id="ct-subject" value={form.subject} onChange={set('subject')} placeholder="Order enquiry, book request…" className="field" /></div>
            </div>
            <div className="mt-4">
              <label htmlFor="ct-message" className="label">Message *</label>
              <textarea id="ct-message" rows={6} value={form.message} onChange={set('message')} className="field resize-none" required />
            </div>
            <button type="submit" disabled={busy} className="btn-primary mt-5 gap-2 sm:px-8">
              {busy ? <Spinner size={15} /> : <><FiSend size={15} /> Send message</>}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
              <p className="mb-4 font-display text-base font-bold text-ink-900">Store details</p>
              <ul className="space-y-3.5 text-sm">
                {settings?.address && <li className="flex gap-3"><FiMapPin size={16} className="mt-0.5 shrink-0 text-brand-600" /><span className="text-pretty leading-relaxed text-ink-600">{settings.address}</span></li>}
                {settings?.phone && <li className="flex gap-3"><FiPhone size={16} className="mt-0.5 shrink-0 text-brand-600" /><a href={`tel:${settings.phone}`} className="font-medium text-ink-800 hover:text-brand-600">{settings.phone}</a></li>}
                {settings?.email && <li className="flex gap-3"><FiMail size={16} className="mt-0.5 shrink-0 text-brand-600" /><a href={`mailto:${settings.email}`} className="break-all font-medium text-ink-800 hover:text-brand-600">{settings.email}</a></li>}
                {settings?.openingHours && <li className="flex gap-3"><FiClock size={16} className="mt-0.5 shrink-0 text-brand-600" /><span className="text-ink-600">{settings.openingHours}</span></li>}
              </ul>
            </div>
            {settings?.mapEmbedUrl && (
              <div className="overflow-hidden rounded-3xl border border-ink-100">
                <iframe src={settings.mapEmbedUrl} title="Store location" loading="lazy" className="h-56 w-full border-0" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </aside>
        </div>
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}

const POLICY_META = {
  shipping: { title: 'Shipping & delivery', eyebrow: 'Policy' },
  returns: { title: 'Returns & refunds', eyebrow: 'Policy' },
  privacy: { title: 'Privacy policy', eyebrow: 'Legal' },
  terms: { title: 'Terms of service', eyebrow: 'Legal' },
};

export function Policy() {
  const { slug } = useParams();
  const { settings } = useStore();
  const meta = POLICY_META[slug];
  const content = settings?.policies?.[slug];
  if (!meta) return <NotFound />;

  return (
    <>
      <Seo title={meta.title} description={`${meta.title} at Subham Xerox.`} path={`/policy/${slug}`} />
      <div className="container-x max-w-3xl py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: meta.title }]} className="mb-5" />
        <SectionHeader eyebrow={meta.eyebrow} title={meta.title} />
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          {content
            // eslint-disable-next-line react/no-danger
            ? <div className="prose-store" dangerouslySetInnerHTML={{ __html: content }} />
            : <p className="text-sm text-ink-500">This policy hasn't been published yet. Please <Link to="/contact" className="font-semibold text-brand-600">contact us</Link> and we'll answer directly.</p>}
        </div>
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}

export function NotFound() {
  const { setSearchOpen } = useStore();
  return (
    <>
      <Seo title="Page not found" path="/404" noIndex />
      <div className="container-x py-24">
        <EmptyState icon={FiAlertTriangle} title="That page doesn't exist"
          description="The link may be out of date, or the product may have been removed. Try searching for what you need."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn-primary gap-2"><FiHome size={15} /> Go home</Link>
              <button type="button" onClick={() => setSearchOpen(true)} className="btn-outline gap-2"><FiSearch size={15} /> Search the store</button>
            </div>
          } />
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}

export default About;
