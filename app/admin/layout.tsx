import { AdminLangProvider } from './_components/AdminLang';
import { AdminAuthProvider } from './_components/AdminAuth';
import { AdminCountsProvider } from './_components/AdminCounts';
import { ToastProvider } from './_components/ui/Toast';
import AdminGate from './_components/AdminGate';
import { getAdminSession } from '@/lib/requireAdmin';

// Server component: the session is verified here (cookie → Supabase auth
// server) before any admin page is rendered. Unauthenticated visitors only
// ever receive the sign-in screen.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  return (
    <AdminLangProvider>
      <ToastProvider>
        <AdminAuthProvider initialEmail={session?.email ?? null}>
          <AdminCountsProvider>
            <AdminGate serverAuthed={Boolean(session)}>{session ? children : null}</AdminGate>
          </AdminCountsProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </AdminLangProvider>
  );
}
