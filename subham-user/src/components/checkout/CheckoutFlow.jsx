/**
 * Direct Custom Guest Checkout — 1-Page Instant Checkout (No OTP delay).
 *
 * Single, self-contained overlay that collects customer info, delivery address,
 * calculates live shipping charges per pincode, and directly opens Razorpay.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStore } from '../../context/StoreContext';
import {
  sendOtp, verifyOtp, createDirectSession, getQuote, placeOrder, preloadCheckout, normalisePhone,
} from '../../lib/checkout';
import { beginShiprocketCheckout } from '../../lib/shiprocketSession';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const SESSION_KEY = 'sx_checkout_session';
const ADDRESS_KEY = 'sx_checkout_address';

const readSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.token || !s?.expiresAt || Date.now() > s.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
};

const writeSession = (token, phone) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, phone, expiresAt: Date.now() + 28 * 60 * 1000 }));
  } catch { /* private mode */ }
};

const clearSession = () => { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } };

const readAddress = () => {
  try { return JSON.parse(localStorage.getItem(ADDRESS_KEY)) || null; } catch { return null; }
};
const writeAddress = (form) => {
  try { localStorage.setItem(ADDRESS_KEY, JSON.stringify(form)); } catch { /* ignore */ }
};

export default function CheckoutFlow({ onClose, items }) {
  const { cart: storeCart, clearCart, settings, toast } = useStore();

  const cart = items?.length ? items : storeCart;
  const navigate = useNavigate();
  const useShiprocket = settings?.checkout?.mode === 'shiprocket';

  const resumed = readSession();
  const savedAddr = readAddress() || {};

  const [step, setStep] = useState('address');   // address | otp | paying
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState(resumed?.phone || savedAddr?.phone || '');
  const [code, setCode] = useState('');
  const [token, setToken] = useState(resumed?.token || '');
  const [resendIn, setResendIn] = useState(0);
  const [shiprocketError, setShiprocketError] = useState('');
  const [shiprocketStarting, setShiprocketStarting] = useState(false);
  const [shiprocketRetry, setShiprocketRetry] = useState(0);
  const shiprocketStarted = useRef(false);

  const [form, setForm] = useState(() => ({
    name: '', email: '', address: '', address2: '', landmark: '',
    city: '', state: '', pincode: '',
    ...savedAddr,
  }));
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  const otpRef = useRef(null);

  /* Warm Razorpay SDK early */
  useEffect(() => { preloadCheckout(); }, []);

  /* Fastrr / Shiprocket Checkout Mode */
  useEffect(() => {
    if (!useShiprocket || shiprocketStarted.current) return;
    shiprocketStarted.current = true;
    let active = true;
    setShiprocketStarting(true);
    setShiprocketError('');
    beginShiprocketCheckout(cart)
      .then(({ checkoutUrl }) => {
        if (!active) return;
        const width = 480;
        const height = 750;
        const left = Math.max(0, Math.round((window.screen.width - width) / 2));
        const top = Math.max(0, Math.round((window.screen.height - height) / 2));
        const popup = window.open(
          checkoutUrl,
          'FastrrCheckoutWindow',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=yes`,
        );
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          window.location.assign(checkoutUrl);
        } else {
          popup.focus();
          onClose?.();
        }
      })
      .catch((err) => {
        if (!active) return;
        shiprocketStarted.current = false;
        setShiprocketError(err.message || 'Could not start Shiprocket Checkout');
        setShiprocketStarting(false);
      });
    return () => { active = false; };
  }, [useShiprocket, shiprocketRetry]);

  useEffect(() => {
    if (!resendIn) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => { if (step === 'otp') otpRef.current?.focus(); }, [step]);

  /* Re-quote on pincode complete */
  useEffect(() => {
    if (step !== 'address' || !/^\d{6}$/.test(form.pincode)) { setQuote(null); return undefined; }
    let cancelled = false;
    setQuoting(true);
    getQuote(cart, form.pincode)
      .then((q) => { if (!cancelled) setQuote(q); })
      .catch(() => { if (!cancelled) setQuote(null); })
      .finally(() => { if (!cancelled) setQuoting(false); });
    return () => { cancelled = true; };
  }, [form.pincode, step, cart]);

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e.message || 'Something went wrong'); } finally { setBusy(false); }
  };

  const doSendOtp = () => run(async () => {
    if (!normalisePhone(phone)) throw new Error('Enter a valid 10-digit mobile number');
    const res = await sendOtp(phone);
    setStep('otp');
    setResendIn(60);
    if (res?.devCode) toast?.(`Dev mode — your code is ${res.devCode}`);
  });

  const doVerifyOtp = () => run(async () => {
    const t = await verifyOtp(phone, code);
    setToken(t);
    writeSession(t, normalisePhone(phone));
    setStep('address');
  });

  const doPay = () => run(async () => {
    const cleanPhone = normalisePhone(phone);
    if (!cleanPhone) throw new Error('Enter a valid 10-digit mobile number');

    setStep('paying');
    try {
      let activeToken = token;
      if (!activeToken) {
        activeToken = await createDirectSession(cleanPhone);
        setToken(activeToken);
        writeSession(activeToken, cleanPhone);
      }

      const result = await placeOrder(cart, {
        token: activeToken,
        customer: { name: form.name, email: form.email },
        address: {
          address: form.address, address2: form.address2, landmark: form.landmark,
          city: form.city, state: form.state, pincode: form.pincode,
        },
        storeName: settings?.storeName,
        logo: settings?.logo,
      });

      writeAddress({ ...form, phone: cleanPhone });
      clearSession();
      clearCart?.();
      navigate(`/order-placed?order=${result.orderNumber}&phone=${cleanPhone}`, { replace: true });
      onClose?.();
    } catch (e) {
      if (/verify your mobile|verification expired/i.test(e.message || '')) {
        clearSession();
        setToken('');
      }
      setStep('address');
      throw e;
    }
  });

  const addressValid = form.name.trim().length >= 2
    && normalisePhone(phone)
    && form.address.trim().length >= 5
    && form.city.trim() && form.state.trim()
    && /^\d{6}$/.test(form.pincode);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (useShiprocket) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" aria-label="Shiprocket checkout">
        <div className="w-full max-w-md rounded-t-2xl bg-white p-6 text-center sm:rounded-2xl">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <h2 className="text-lg font-bold text-ink-900">Opening Shiprocket Checkout</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">We are confirming the latest price and availability for your cart.</p>
          {shiprocketError && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{shiprocketError}</div>}
          {shiprocketError ? (
            <div className="mt-5 flex gap-2">
              <button type="button" className="btn-outline flex-1" onClick={onClose}>Back to cart</button>
              <button type="button" className="btn-primary flex-1" onClick={() => setShiprocketRetry((n) => n + 1)}>Try again</button>
            </div>
          ) : <p className="mt-5 text-xs font-medium text-ink-400">{shiprocketStarting ? 'Connecting securely…' : 'Preparing checkout…'}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-2xl sm:p-5">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              {step === 'otp' ? 'Verify Mobile Number' : 'Checkout & Delivery Details'}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {step === 'otp' ? `Sent OTP to +91 ${phone}` : 'Enter details to complete your order'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-ink-400 hover:text-ink-700" aria-label="Close">×</button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>
        )}

        {/* ── OTP Verification Fallback ── */}
        {step === 'otp' && (
          <form onSubmit={(e) => { e.preventDefault(); doVerifyOtp(); }}>
            <p className="mb-3 text-sm text-ink-500">
              Sent to +91 {phone}.{' '}
              <button type="button" onClick={() => { setStep('address'); setCode(''); }} className="font-semibold text-brand-700">Change</button>
            </p>
            <input
              ref={otpRef} type="text" inputMode="numeric" autoComplete="one-time-code"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              className="block w-full box-border rounded-lg border border-ink-200 px-3 py-2.5 text-center text-lg tracking-[0.4em] outline-none focus:border-brand-600"
            />
            <button type="submit" disabled={busy || code.length < 4} className="btn-primary mt-4 block w-full py-3.5">
              {busy ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button
              type="button" disabled={resendIn > 0 || busy} onClick={doSendOtp}
              className="mt-3 w-full text-sm text-ink-500 disabled:opacity-50"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
            </button>
          </form>
        )}

        {/* ── Direct 1-Page Custom Checkout Form ── */}
        {(step === 'address' || step === 'paying') && (
          <form onSubmit={(e) => { e.preventDefault(); doPay(); }} className="w-full space-y-3">
            <Field label="Full name" value={form.name} onChange={set('name')} autoComplete="name" autoFocus required placeholder="Enter your full name" />
            
            <label className="block w-full">
              <span className="mb-1 block text-xs font-semibold text-ink-600">Mobile Number</span>
              <div className="flex w-full items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2.5">
                <span className="text-sm font-semibold text-ink-500">+91</span>
                <input
                  type="tel" inputMode="numeric" autoComplete="tel" required
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="w-full min-w-0 bg-transparent text-base outline-none placeholder:text-ink-400"
                />
              </div>
            </label>

            <Field label="Address" value={form.address} onChange={set('address')} autoComplete="street-address" required placeholder="House no / street / area" />
            <Field label="Landmark (optional)" value={form.landmark} onChange={set('landmark')} placeholder="Near school / hospital / park" />
            
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
              <div className="min-w-0">
                <Field label="PIN code" value={form.pincode} inputMode="numeric" autoComplete="postal-code"
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} required placeholder="6-digit PIN" />
              </div>
              <div className="min-w-0">
                <Field label="City" value={form.city} onChange={set('city')} autoComplete="address-level2" required placeholder="City" />
              </div>
            </div>
            <Field label="State" value={form.state} onChange={set('state')} autoComplete="address-level1" required placeholder="State" />
            <Field label="Email (optional)" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="For instant invoice receipt" />

            <div className="rounded-lg bg-ink-50 p-3 text-sm">
              <Row label="Subtotal" value={money(quote?.subtotal ?? 0)} />
              <Row
                label="Delivery"
                value={quoting ? 'Checking…' : (quote ? (quote.shippingCharge ? money(quote.shippingCharge) : 'Free') : '—')}
              />
              {quote?.shipping?.etd && <p className="mt-1 text-xs text-ink-500">Estimated delivery: {quote.shipping.etd}</p>}
              <div className="mt-2 flex justify-between border-t border-ink-200 pt-2 font-bold text-ink-900">
                <span>Total</span><span>{quote ? money(quote.total) : '—'}</span>
              </div>
            </div>

            {quote?.shipping?.serviceable === false && (
              <p className="text-sm text-red-700">We cannot deliver to this PIN code yet.</p>
            )}

            <button
              type="submit"
              disabled={busy || !addressValid || !quote || quote?.shipping?.serviceable === false}
              className="btn-primary block w-full py-3.5"
            >
              {step === 'paying' ? 'Opening Payment…' : `Pay ${quote ? money(quote.total) : ''}`}
            </button>

            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>🔒 100% Secure Checkout</span>
              <span>UPI, Cards, NetBanking</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, className = '', ...props }) {
  return (
    <label className="block w-full">
      <span className="mb-1 block text-xs font-semibold text-ink-600">{label}</span>
      <input
        {...props}
        className={`block w-full min-w-0 box-border appearance-none rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-base leading-normal text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-600 ${className}`}
      />
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-ink-600">
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
