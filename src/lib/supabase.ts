import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhogqynmbdmlxhbrmrke.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2dxeW5tYmRtbHhoYnJtcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDM3MTgsImV4cCI6MjA5MDY3OTcxOH0.t5khDgoQSo_fbjv-sv45u5S8p2QCLGRhrwnsoB2AHuE';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
