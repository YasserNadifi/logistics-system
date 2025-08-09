import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

// Clean, modern Tailwind AlertsPage
// - Shows LOW_STOCK (inventory) and SHIPMENT_DELAYED alerts
// - Fetches GET /api/alerts
// - DELETE /api/alerts/:id to dismiss
// - Tailwind CSS required in project

function Svg({ children, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

function Icon({ type }) {
  if (type === 'LOW_STOCK') {
    return (
      <Svg className="w-6 h-6 text-yellow-600">
        <path d="M3 7.5L12 3l9 4.5V17a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  // SHIPMENT_DELAYED
  return (
    <Svg className="w-6 h-6 text-red-600">
      <path d="M3 7h13v8H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 9h4l1 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const BADGE = {
  LOW_STOCK: { label: 'Low stock', color: 'bg-yellow-100 text-yellow-800' },
  SHIPMENT_DELAYED: { label: 'Shipment delayed', color: 'bg-red-100 text-red-800' },
};

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(new Set());
  const [error, setError] = useState('');

  const token = localStorage.getItem('jwt');
  
    useEffect(() => {
    let mounted = true;
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:8080/alert', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!mounted) return;
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAlerts(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Could not load alerts');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAlerts();
    return () => { mounted = false; };
  }, []);

  const dismiss = async (id) => {
    if (busy.has(id)) return;
    setBusy(prev => new Set(prev).add(id));
    try {
      await axios.delete(`/api/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to dismiss alert');
    } finally {
      setBusy(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (filter !== 'ALL' && a.type !== filter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        String(a.id).includes(s) ||
        (a.message && a.message.toLowerCase().includes(s)) ||
        (a.productId && String(a.productId).includes(s)) ||
        (a.shipmentId && String(a.shipmentId).includes(s))
      );
    });
  }, [alerts, filter, q]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              {/* <span className="p-2 rounded-xl bg-white shadow"><Svg className="w-6 h-6 text-indigo-600"><path d="M12 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></Svg></span> */}
              Alerts
            </h2>
            <p className="text-sm text-slate-500 mt-1">Real-time notifications for inventory & shipments.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center bg-white rounded-lg shadow px-2 py-1">
              <button
                onClick={() => setFilter('ALL')}
                className={`text-sm px-3 py-1 rounded-md ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
              >All</button>
              <button
                onClick={() => setFilter('LOW_STOCK')}
                className={`text-sm px-3 py-1 rounded-md ${filter === 'LOW_STOCK' ? 'bg-yellow-400 text-white' : 'text-slate-600'}`}
              >Low stock</button>
              <button
                onClick={() => setFilter('SHIPMENT_DELAYED')}
                className={`text-sm px-3 py-1 rounded-md ${filter === 'SHIPMENT_DELAYED' ? 'bg-red-500 text-white' : 'text-slate-600'}`}
              >Delayed</button>
            </div>

            <div className="relative">
              <input
                aria-label="Search alerts"
                className="w-72 pr-10 pl-3 py-2 rounded-lg border border-gray-200 bg-white text-sm shadow-sm"
                placeholder="Search id, message, product, shipment..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >✕</button>
              )}
            </div>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="grid place-items-center py-20">
            <div className="animate-pulse">
              <div className="h-6 w-56 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-72 bg-gray-200 rounded" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white p-8 text-center shadow">
                <Svg className="mx-auto w-10 h-10 text-indigo-500 mb-3"><path d="M12 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></Svg>
                <h3 className="text-lg font-semibold text-slate-900">No alerts right now</h3>
                <p className="text-sm text-slate-500 mt-2">Everything looks good — check back later.</p>
              </div>
            ) : (
              filtered.map(a => {
                const isProduct = !!a.productId && !a.shipmentId;
                const meta = isProduct ? `Product #${a.productId}` : `Shipment #${a.shipmentId}`;
                const badge = BADGE[a.type] || { label: a.type, color: 'bg-gray-100 text-slate-800' };

                return (
                  <article key={a.id} className="group rounded-2xl bg-white p-5 shadow hover:shadow-lg transition-shadow duration-150">
                    <div className="flex items-start gap-4">
                      <div className="flex-none w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                        <Icon type={a.type} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-slate-900 truncate">{a.message || (isProduct ? 'Low stock' : 'Shipment delayed')}</h4>
                            <div className="text-xs text-slate-500 mt-1 truncate">{meta}</div>
                          </div>

                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>{badge.label}</span>
                            <div className="text-xs text-slate-400 mt-1">{formatDate(a.createdAt)}</div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isProduct && (
                              <a href={`/products/${a.productId}`} className="text-sm text-indigo-600 hover:underline">View product</a>
                            )}
                            {a.shipmentId && (
                              <a href={`/shipments/${a.shipmentId}`} className="text-sm text-indigo-600 hover:underline">View shipment</a>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigator.clipboard?.writeText(JSON.stringify(a))}
                              className="text-slate-400 hover:text-slate-600 p-2 rounded-md"
                              title="Copy payload"
                              aria-label="Copy payload"
                            >
                              <Svg className="w-4 h-4"><path d="M9 9H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="3" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></Svg>
                            </button>

                            <button
                              onClick={() => dismiss(a.id)}
                              disabled={busy.has(a.id)}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm text-red-600 hover:bg-red-50"
                              aria-label="Dismiss alert"
                            >
                              {busy.has(a.id) ? (
                                <Svg className="w-4 h-4 animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25"/><path d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12z" fill="currentColor"/></Svg>
                              ) : (
                                <Svg className="w-4 h-4"><path d="M3 6h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></Svg>
                              )}
                              <span className="sr-only">Dismiss</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
