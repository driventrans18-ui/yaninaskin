'use client';

import { useState, useEffect } from 'react';
import AdminReviewsPanel from './AdminReviewsPanel';
import AdminLogin from '../_components/AdminLogin';
import { useAdminT } from '../_components/AdminLang';

export default function AdminReviewsPage() {
  const { t } = useAdminT();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin-auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        subtitle={t.subReviews}
        error={error}
        onSubmit={(pw) => {
          if (pw === 'skinbeauty') {
            setIsAuthenticated(true);
            localStorage.setItem('admin-auth', 'true');
            setError('');
          } else {
            setError(t.incorrectPassword);
          }
        }}
      />
    );
  }

  return <AdminReviewsPanel onLogout={handleLogout} />;
}
