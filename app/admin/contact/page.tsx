'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import AdminGate from '../_components/AdminGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getContactSubmissions, markContactRead, deleteContactSubmission } from '../../actions/contact';

type Submission = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

function ContactInbox() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const result = await getContactSubmissions();
    if (result.success) setItems(result.data as Submission[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (id: string, current: boolean) => {
    await markContactRead(id, !current);
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: !current } : i));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await deleteContactSubmission(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const unread = items.filter(i => !i.read).length;

  return (
    <AdminShell active="contact">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Contact Messages</h2>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unread} unread</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm py-12 text-center">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <Card
              key={item.id}
              className={`p-5 transition-opacity ${item.read ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-muted-foreground">
                    <a href={`tel:${item.phone}`} className="hover:text-foreground transition-colors">
                      {item.phone}
                    </a>
                    <a href={`mailto:${item.email}`} className="hover:text-foreground transition-colors">
                      {item.email}
                    </a>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
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

export default function AdminContactPage() {
  return (
    <AdminGate>
      <ContactInbox />
    </AdminGate>
  );
}
