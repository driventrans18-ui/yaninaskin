'use client';

export function AdminSetupWarning() {
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-900">
        <strong>⚠️ Setup Required:</strong> The admin panel requires SUPABASE_SERVICE_ROLE_KEY to be set in your environment variables for save operations to work.
      </p>
      <p className="text-xs text-yellow-800 mt-2">
        Follow the setup guide at <code className="bg-yellow-100 px-1">/ADMIN_SETUP.md</code> or visit <code className="bg-yellow-100 px-1">/api/admin/diagnostic</code> to check status.
      </p>
    </div>
  );
}
