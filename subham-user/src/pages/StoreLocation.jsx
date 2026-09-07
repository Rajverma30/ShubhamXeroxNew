import Seo, { storeSchema, breadcrumbSchema } from '../components/ui/Seo';
import { FiMapPin, FiPhone, FiClock, FiCheckCircle, FiNavigation, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function StoreLocation() {
  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Store Location - Indore' }
  ];

  const keywords = [
    'Shubham Xerox Indore',
    'Subham Xerox Bhawarkua',
    'Book store near Bhawarkua Indore',
    'MPPSC book shop Indore',
    'Shubham Xerox address phone number',
    'Stationery shop Indore Bhawarkua',
    'Photocopy xerox shop Bhawarkua'
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Seo
        title="Store Location & Contact Indore | Shubham Xerox (Subham Xerox)"
        description="Visit Shubham Xerox main store at Bhawarkua Square, Indore. MPPSC guides, competitive exam books, MP board textbooks & premium stationery available."
        path="/store-indore"
        keywords={keywords}
        schema={[storeSchema(), breadcrumbSchema(breadcrumbs)]}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-ink-950 via-slate-900 to-ink-900 text-white py-14 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <FiMapPin className="text-brand-400" /> Store Location & Local Pickup
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Shubham Xerox Main Store - Bhawarkua, Indore
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Central India's leading bookstore for MPPSC, MP Board, competitive exam notes, school books & premium stationery.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FiMapPin className="text-brand-600" /> Visit Our Store
              </h2>

              <div className="space-y-5 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="bg-brand-50 p-2.5 rounded-xl text-brand-600 shrink-0">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Address</h3>
                    <p className="mt-1 leading-relaxed">
                      Shubham Xerox (Subham Xerox)<br />
                      Near Bhawarkua Square, Main Road,<br />
                      Indore, Madhya Pradesh 452001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 shrink-0">
                    <FiPhone size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Phone / WhatsApp</h3>
                    <p className="mt-1">
                      <a href="tel:+919876543210" className="text-brand-600 font-semibold hover:underline">
                        +91 98765 43210
                      </a>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Call or WhatsApp for direct inquiry</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 shrink-0">
                    <FiClock size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Store Timings</h3>
                    <p className="mt-1 text-slate-700">Monday - Saturday: 9:00 AM - 9:30 PM</p>
                    <p className="text-slate-700">Sunday: 10:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <a
                  href="https://maps.google.com/?q=Bhawarkua+Square+Indore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center text-sm py-3"
                >
                  <FiNavigation className="mr-2" /> Get Directions on Google Maps
                </a>
                <Link to="/shop" className="btn-secondary w-full justify-center text-sm py-3">
                  <FiShoppingBag className="mr-2" /> Order Online (Home Delivery)
                </Link>
              </div>
            </div>

            {/* Why Visit Us */}
            <div className="bg-gradient-to-br from-brand-900 to-ink-950 text-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-white">Why Students Choose Us?</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-emerald-400 mt-1 shrink-0" />
                  <span><strong>100% Original Books:</strong> Direct from publishers like Ghatna Chakra, Arihant, Lucent & TMH.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-emerald-400 mt-1 shrink-0" />
                  <span><strong>Indore Local Express Delivery:</strong> Same day delivery across Indore & Bhawarkua area.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-emerald-400 mt-1 shrink-0" />
                  <span><strong>Xerox & Printing Services:</strong> High speed bulk printing, spiral binding & MPPSC study materials.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Embedded Google Map & Store Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Location Map</h2>
              <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-slate-200">
                <iframe
                  title="Shubham Xerox Bhawarkua Indore Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14723.364239851173!2d75.85698544999999!3d22.6934255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd02d1d0ab91%3A0x6b63d76e4ed9f257!2sBhawarkua%20Square%2C%20Indore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Popular Exam Books in Store */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Available at Store & Online</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <h3 className="font-bold text-slate-800 mb-1">MPPSC Exam Materials</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Prelims & Mains solved papers, Ghatna Chakra Purvavlokan series, Nirmaan IAS notes, and English/Hindi medium guides.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <h3 className="font-bold text-slate-800 mb-1">MP Board & NCERT Books</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Class 9th to 12th Pariksha Bodh, Pariksha Adhyayan, Yugbodh guides & NCERT textbooks.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <h3 className="font-bold text-slate-800 mb-1">SSC & Banking Preparation</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rakesh Yadav Math, Neetu Singh English, Lucent GK, and Test Series printed sheets.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <h3 className="font-bold text-slate-800 mb-1">Stationery & Office Supplies</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Highlighters, Gel Pens, Spiral Registers, Sticky Notes, Files and Exam Clipboard.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
