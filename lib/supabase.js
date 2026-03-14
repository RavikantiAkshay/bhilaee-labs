import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Check if we are using placeholders
const isPlaceholder = supabaseUrl.includes('placeholder');

if (isPlaceholder) {
  console.error('Supabase client is using PLACEHOLDER values. Authentication will fail.');
} else {
  console.info('Supabase client initialized with URL:', supabaseUrl.substring(0, 15) + '...');
}

// 15. Create client with custom fetch to bypass Next.js caching in production
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (...args) => fetch(args[0], { ...args[1], cache: 'no-store' }),
  },
});
