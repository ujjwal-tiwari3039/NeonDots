/**
 * Supabase Client Configuration
 * 
 * Replace the placeholder values below with your actual Supabase credentials.
 * Only the publishable (anon) key should be used here — NEVER the secret/service-role key.
 */

import { createClient } from '@supabase/supabase-js';

// ─── PASTE YOUR CREDENTIALS HERE ───────────────────────────────────────────────
const SUPABASE_URL = 'https://iajgueuwdtpulkmqnihd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_stlt5fBdF3eEKAi-asCOCw_SiLSfWrm';
// ────────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
