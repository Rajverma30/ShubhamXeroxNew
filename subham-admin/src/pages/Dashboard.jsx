/**
 * Dashboard.
 *
 * Orders and revenue are stored in this system and live on /orders
 * and showing a partial copy here would be misleading. What's left is what
 * this panel actually controls — the catalogue, site traffic, and the content
 * queues waiting on the admin.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  FiAlertTriangle, FiBookOpen, FiExternalLink, FiEye, FiFileText, FiGrid, FiMail,
  FiMessageSquare, FiPackage, FiSearch, FiStar, FiTrendingUp,
} from 'react-icons/fi';
import api from '../lib/api';
import { dateShort, imgUrl, money, number } from '../lib/format';
import { Badge, EmptyState, ErrorBlock, LoadingBlock, PageHeader, SectionCard } from '../components/Ui';

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

const PIE_COLORS = ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'];

export default function Dashboard() {
  const [days, setDays] = useState(30);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', days],
    queryFn: () => api.dashboard(days),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingBlock label="Loading your store…" />;
  if (error) return <ErrorBlock error={error} onRetry={refetch} />;

  const c = data?.cards || {};

  const cards = [
    { label: 'Visitors', value: number(c.visitors), sub: `${number(c.pageViews)} page views`, icon: FiEye, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Products', value: number(c.products), sub: `${number(c.books)} books · ${number(c.stationery)} stationery`, icon: FiPackage, tone: 'bg-amber-50 text-amber-600', to: '/products' },
    { label: 'Ebooks', value: number(c.ebooks), sub: 'With a free download attached', icon: FiFileText, tone: 'bg-teal-50 text-teal-600', to: '/products?type=ebook' },
    { label: 'Categories', value: `${number(c.categories)} / ${number(c.subCategories)}`, sub: 'Categories / sub categories', icon: FiGrid, tone: 'bg-indigo-50 text-indigo-600', to: '/categories' },
    { label: 'Newsletter', value: number(c.newsletter), sub: 'Active subscribers', icon: FiMail, tone: 'bg-rose-50 text-rose-600', to: '/newsletter' },
    { label: 'Out of stock', value: number(c.outOfStock), sub: 'Needs restocking', icon: FiAlertTriangle, tone: 'bg-orange-50 text-orange-600', to: '/products?stock=out' },
    { label: 'Reviews to moderate', value: number(c.pendingReviews), sub: 'Awaiting approval', icon: FiStar, tone: 'bg-brand-50 text-brand-600', to: '/reviews?isApproved=false' },
    { label: 'Unread messages', value: number(c.unreadContacts), sub: 'From the contact form', icon: FiMessageSquare, tone: 'bg-sky-50 text-sky-600', to: '/messages?status=new' },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Catalogue and traffic over the last ${days} days`}
        actions={
          <>
            <Link
              to="/orders"
              className="btn-outline btn-sm gap-1.5"
            >
              View orders
            </Link>
            <div className="flex rounded-xl border border-ink-200 bg-white p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setDays(r.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    days === r.value ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        }
      />

      {/* Orders live in this panel now. */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3">
        <FiTrendingUp size={15} className="shrink-0 text-ink-400" />
        <p className="text-xs text-ink-600">
          Orders are paid through Razorpay and stored here. Open the Orders screen to fulfil them.
        </p>
        <Link to="/orders" className="ml-auto text-2xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-700">
          View orders &rarr;
        </Link>
      </div>

      {(c.pendingReviews > 0 || c.unreadContacts > 0 || c.outOfStock > 0) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {c.outOfStock > 0 && (
            <Link to="/products?stock=out" className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3.5 py-2 text-xs font-semibold text-orange-800 transition-colors hover:bg-orange-100">
              <FiAlertTriangle size={13} /> {c.outOfStock} product{c.outOfStock > 1 ? 's' : ''} out of stock
            </Link>
          )}
          {c.pendingReviews > 0 && (
            <Link to="/reviews?isApproved=false" className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100">
              <FiStar size={13} /> {c.pendingReviews} review{c.pendingReviews > 1 ? 's' : ''} to moderate
            </Link>
          )}
          {c.unreadContacts > 0 && (
            <Link to="/messages?status=new" className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100">
              <FiMessageSquare size={13} /> {c.unreadContacts} unread message{c.unreadContacts > 1 ? 's' : ''}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const body = (
            <div className="card h-full p-4 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start justify-between gap-2">
                <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">{card.label}</p>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.tone}`}><Icon size={15} /></span>
              </div>
              <p className="mt-2.5 text-xl font-bold text-ink-900 sm:text-2xl">{card.value}</p>
              <p className="mt-0.5 truncate text-2xs text-ink-400">{card.sub}</p>
            </div>
          );
          return card.to ? <Link key={card.label} to={card.to}>{body}</Link> : <div key={card.label}>{body}</div>;
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <SectionCard title="Store traffic" description={`Visitors and page views · last ${days} days`} className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.traffic || []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="date" tickFormatter={dateShort} tick={{ fontSize: 11, fill: '#8591ab' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#8591ab' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 12 }}
                  labelFormatter={(l) => new Date(l).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                />
                <Area type="monotone" dataKey="pageViews" name="Page views" stroke="#4f46e5" strokeWidth={2.5} fill="url(#views)" />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#0ea5e9" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Product mix" description="Catalogue by type">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(data?.charts?.productTypes || []).map((t) => ({ name: t._id, value: t.count }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="52%"
                  outerRadius="80%"
                  paddingAngle={3}
                >
                  {(data?.charts?.productTypes || []).map((t, i) => (
                    <Cell key={t._id} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 12 }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Most viewed products"
          actions={<Link to="/products" className="text-2xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-700">All products</Link>}
        >
          {data?.topViewed?.length ? (
            <ul className="divide-y divide-ink-50">
              {data.topViewed.map((p) => (
                <li key={p._id} className="flex items-center gap-3 py-3">
                  {p.images?.[0] && (
                    <img src={imgUrl(p.images[0])} alt="" className="h-11 w-8 shrink-0 rounded border border-ink-100 object-cover" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-900">{p.title}</span>
                    <span className="block text-2xs text-ink-400">{money(p.finalPrice)} · {p.stock} in stock</span>
                  </span>
                  <Badge tone="brand">{number(p.views)} views</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FiBookOpen} title="No traffic data yet" description="Product views appear here as customers browse." />
          )}
        </SectionCard>

        <SectionCard
          title="Recently added"
          actions={<Link to="/products/new" className="text-2xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-700">Add product</Link>}
        >
          {data?.recentProducts?.length ? (
            <ul className="divide-y divide-ink-50">
              {data.recentProducts.map((p) => (
                <li key={p._id} className="flex items-center gap-3 py-3">
                  {p.images?.[0] && (
                    <img src={imgUrl(p.images[0])} alt="" className="h-11 w-8 shrink-0 rounded border border-ink-100 object-cover" />
                  )}
                  <Link to={`/products/${p._id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900 hover:text-brand-700">
                    {p.title}
                  </Link>
                  <Badge tone={p.isActive ? 'green' : 'neutral'}>{p.isActive ? 'live' : 'draft'}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FiPackage} title="No products yet" />
          )}
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <SectionCard title="Low stock" description="Restock these soon">
          {data?.lowStock?.length ? (
            <ul className="space-y-2.5">
              {data.lowStock.map((p) => (
                <li key={p._id} className="flex items-center gap-3">
                  <Link to={`/products/${p._id}`} className="min-w-0 flex-1 truncate text-xs font-medium text-ink-800 hover:text-brand-700">{p.title}</Link>
                  <Badge tone={p.stock === 0 ? 'rose' : 'amber'}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-ink-400">Everything is comfortably in stock.</p>
          )}
        </SectionCard>

        <SectionCard title="Top searches" description="What customers look for">
          {data?.topSearches?.length ? (
            <ul className="space-y-2.5">
              {data.topSearches.map((s) => (
                <li key={s.term} className="flex items-center gap-2">
                  <FiSearch size={12} className="shrink-0 text-ink-300" />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink-700">{s.term}</span>
                  <Badge>{s.count}×</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-ink-400">No searches recorded yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Searches with no results" description="Stock gaps worth filling">
          {data?.noResultSearches?.length ? (
            <ul className="space-y-2.5">
              {data.noResultSearches.map((s) => (
                <li key={s.term} className="flex items-center gap-2">
                  <FiSearch size={12} className="shrink-0 text-ink-300" />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink-700">{s.term}</span>
                  <Badge>{s.count}×</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-ink-400">Every search is finding results. Nice.</p>
          )}
        </SectionCard>
      </div>
    </>
  );
}
