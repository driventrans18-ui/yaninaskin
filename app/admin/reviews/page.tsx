import { Suspense } from 'react';
import ReviewsWorkspace from './ReviewsWorkspace';

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={null}>
      <ReviewsWorkspace />
    </Suspense>
  );
}
