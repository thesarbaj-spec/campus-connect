import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gifmmalohegoftzfpewr.supabase.co'

const supabasePublishableKey = 'sb_publishable_0_UW78rgGdvtsPvqiYVDPQ_X-G8Bwv9'

export const supabase = createClient(
supabaseUrl,
supabasePublishableKey
)

export const isSupabaseConfigured = () => {
return Boolean(supabaseUrl && supabasePublishableKey)
}