// Supabase Configuration
// Replace these values with your Supabase project credentials

const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxx.supabase.co'
  anonKey: 'YOUR_SUPABASE_ANON_KEY' // Your Supabase anonymous/public key
};

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabaseClient, SUPABASE_CONFIG };
}

