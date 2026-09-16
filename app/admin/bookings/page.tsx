import { Suspense } from 'react';
import BookingsWorkspace from './BookingsWorkspace';

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsWorkspace />
    </Suspense>
  );
}
