import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🛑 DIAGNOSTIC LOGS - These will print in your terminal and browser console
console.log("=== SUPABASE ENV CHECK ===")
console.log("URL SEEN BY APP:", supabaseUrl)
console.log("KEY SEEN BY APP:", supabaseAnonKey ? "Key is present (Hidden for security)" : "UNDEFINED/MISSING")
console.log("==========================")

// Safety Check to prevent the crash and give us a readable error
if (!supabaseUrl) {
  throw new Error("CRASH PREVENTED: NEXT_PUBLIC_SUPABASE_URL is completely missing or empty.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey!)