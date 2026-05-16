'use client';

import { AdminLangProvider } from './_components/AdminLang';
import { AdminAuthProvider } from './_components/AdminAuth';
import AdminGate from './_components/AdminGate';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLangProvider>
      <AdminAuthProvider>
        <AdminGate>{children}</AdminGate>
      </AdminAuthProvider>
    </AdminLangProvider>
  );
}
