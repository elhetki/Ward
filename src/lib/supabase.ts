import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://rspnumcdyrupaohrpios.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)
