import { Suspense } from 'react';
import GalleryWorkspace from './GalleryWorkspace';

export default function AdminGalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryWorkspace />
    </Suspense>
  );
}
