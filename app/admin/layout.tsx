'use client';

import { AdminLangProvider } from './_components/AdminLang';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLangProvider>{children}</AdminLangProvider>;
}
