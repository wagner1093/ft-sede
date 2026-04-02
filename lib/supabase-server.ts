import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    'https://lhogqynmbdmlxhbrmrke.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2dxeW5tYmRtbHhoYnJtcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDM3MTgsImV4cCI6MjA5MDY3OTcxOH0.t5khDgoQSo_fbjv-sv45u5S8p2QCLGRhrwnsoB2AHuE',
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorado em Server Components (só funciona em Route Handlers/Server Actions)
          }
        },
      },
    }
  );
}
