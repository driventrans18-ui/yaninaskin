'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import AdminGate from '../_components/AdminGate';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBookings, markBookingRead, deleteBooking } from '../../actions/bookings';

type Booking = {
  id: string;
  name: string;
  service: string | null;
  price: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  details: string | null;
  method: string | null;
  read: boolean;
  created_at: string;
};

function BookingsInbox() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const result = await getBookings();
    if (result.success) setItems(result.data as Booking[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (id: string, current: boolean) => {
    await markBookingRead(id, !current);
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: !current } : i));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    await deleteBooking(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const unread = items.filter(i => !i.read).length;

  // "2026-06-26" -> "Fri, Jun 26, 2026" without shifting across time zones.
  const formatPreferredDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <AdminShell active="bookings">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Booking Requests</h2>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unread} new</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm py-12 text-center">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">No booking requests yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <Card
              key={item.id}
              className={`p-5 transition-opacity ${item.read ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium text-sm">{item.name}</span>
                    {!item.read && (
                      <span className="text-[10px] uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Service + price */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-medium">
                      {item.service || 'Not specified'}
                    </span>
                    {item.price && (
                      <Badge variant="default">{item.price}</Badge>
                    )}
                  </div>

                  {/* Preferred date / time + channel */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-muted-foreground">
                    {(item.preferred_date || item.preferred_time) && (
                      <span>
                        Preferred:{' '}
                        {[
                          item.preferred_date ? formatPreferredDate(item.preferred_date) : '',
                          item.preferred_time || '',
                        ].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    {item.method && (
                      <span className="uppercase tracking-widest">
                        via {item.method === 'instagram' ? 'Instagram' : 'Text'}
                      </span>
                    )}
                  </div>

                  {item.details && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.details}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRead(item.id, item.read)}
                  >
                    {item.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminBookingsPage() {
  return (
    <AdminGate>
      <BookingsInbox />
    </AdminGate>
  );
}
