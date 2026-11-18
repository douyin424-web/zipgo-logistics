import React, { useState } from 'react';
import { Wallet, Tag, Plus, Trash2, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Card, Field, Button, ErrorNote, EmptyState, formatPKR, formatDateTime, inputCls } from '../components/ui';
import { addMenuItem, toggleMenuItem, removeMenuItem, menuForBusiness, sendSupportMessage, isToday, isWithinDays } from '../data/store';
import { CONTACT_EMAIL } from '../../lib/formsubmit';

// ------------------------------------------------------------ Earnings / spend
export function Spend({ orders }) {
  const delivered = orders.filter((o) => o.status === 'delivered');
  const sum = (list) => list.reduce((total, o) => total + (o.finalFare || o.proposedFare), 0);

  const periods = [
    { label: 'Today', list: delivered.filter((o) => isToday(o.deliveredAt)) },
    { label: 'Last 7 days', list: delivered.filter((o) => isWithinDays(o.deliveredAt, 7)) },
    { label: 'Last 30 days', list: delivered.filter((o) => isWithinDays(o.deliveredAt, 30)) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-heading font-black text-slate-900">Earnings & delivery spend</h1>
        <p className="text-xs text-slate-500 mt-1">How many orders went out and what delivery cost you.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {periods.map(({ label, list }) => (
          <Card key={label} className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
            <div className="text-2xl font-heading font-black text-slate-900 mt-2">{formatPKR(sum(list))}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {list.length} {list.length === 1 ? 'order' : 'orders'} delivered
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-slate-900">Delivered orders</h2>
          <span className="text-xs font-semibold text-slate-500">
            Average {formatPKR(delivered.length ? sum(delivered) / delivered.length : 0)} per order
          </span>
        </div>
        {delivered.length === 0 ? (
          <EmptyState icon={Wallet} title="No delivered orders yet" text="Completed deliveries and their fares will be listed here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {delivered.map((o) => (
              <li key={o.id} className="px-6 py-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-mono font-bold text-slate-900">{o.orderNumber}</div>
                  <div className="text-slate-500 truncate">
                    {o.dropName} · {formatDateTime(o.deliveredAt)}
                  </div>
                </div>
                <span className="font-heading font-bold text-slate-900 shrink-0">{formatPKR(o.finalFare || o.proposedFare)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ Menu items
export function MenuItems({ db, business }) {
  const items = menuForBusiness(db, business.id);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const run = async (action) => {
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || adding) return;
    setAdding(true);
    await run(async () => {
      await addMenuItem(business.id, { name, price });
      setName('');
      setPrice('');
    });
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-heading font-black text-slate-900">Menu items</h1>
        <p className="text-xs text-slate-500 mt-1">Keep your item list up to date and mark items in or out of stock.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <Field label="Item name">
              <input type="text" required placeholder="e.g. Zinger Burger" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="sm:col-span-3">
            <Field label="Price (PKR)">
              <input type="number" min="0" required placeholder="e.g. 550" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Button type="submit" loading={adding} className="sm:col-span-3">
            <Plus className="w-4 h-4" />
            <span>Add item</span>
          </Button>
        </form>
      </Card>

      <ErrorNote>{error}</ErrorNote>

      <Card>
        {items.length === 0 ? (
          <EmptyState icon={Tag} title="No items yet" text="Add your first item using the form above." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className={`text-sm font-bold truncate ${item.inStock ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{item.name}</div>
                  <div className="text-xs text-slate-500">{formatPKR(item.price)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => run(() => toggleMenuItem(item.id))}
                    aria-pressed={item.inStock}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                      item.inStock
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>
                  <button
                    onClick={() => run(() => removeMenuItem(item.id))}
                    aria-label={`Remove ${item.name}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ Support
export function Support({ business }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await sendSupportMessage(business, message);
      setSent(true);
      setMessage('');
    } catch (err) {
      console.error('Support request error:', err);
      setError(`We couldn't send your message. Please email us at ${CONTACT_EMAIL}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-heading font-black text-slate-900">Support</h1>
        <p className="text-xs text-slate-500 mt-1">Need help with an order or your account? Send us a message.</p>
      </div>

      <Card className="p-6 space-y-4">
        {sent ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Message sent.</p>
              <p className="text-xs mt-0.5">Our team will contact you on {business.phone}.</p>
              <button onClick={() => setSent(false)} className="text-xs font-bold text-emerald-700 underline mt-2">
                Send another message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="How can we help?">
              <textarea
                rows="5"
                required
                placeholder="Describe the issue. Include the order number if it is about an order."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <ErrorNote>{error}</ErrorNote>
            <Button type="submit" loading={loading}>
              <Send className="w-4 h-4" />
              <span>Send message</span>
            </Button>
          </form>
        )}

        <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 border-t border-slate-100 pt-4">
          <Mail className="w-3.5 h-3.5" />
          <span>{CONTACT_EMAIL}</span>
        </a>
      </Card>
    </div>
  );
}
