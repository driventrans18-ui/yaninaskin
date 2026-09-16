import { redirect } from 'next/navigation';

// Placeholder until the Dashboard lands (Phase 2): land on the inbox.
export default function AdminIndexPage() {
  redirect('/admin/bookings');
}
