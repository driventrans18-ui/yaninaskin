import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const diagnostics = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('/').pop(),
  };

  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: aboutData, error: aboutError } = await adminClient
      .from('about_content')
      .select('*')
      .limit(1);

    const { data: servicesData, error: servicesError } = await adminClient
      .from('services')
      .select('*')
      .limit(1);

    return Response.json({
      diagnostics,
      tables: {
        about_content: {
          canRead: !aboutError,
          rowCount: aboutData?.length || 0,
          error: aboutError?.message,
        },
        services: {
          canRead: !servicesError,
          rowCount: servicesData?.length || 0,
          error: servicesError?.message,
        },
      },
    });
  } catch (error) {
    return Response.json({
      diagnostics,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
