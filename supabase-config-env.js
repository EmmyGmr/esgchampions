// Supabase Configuration with Environment Variables
// This version reads from environment variables for production deployment
// For local development, fallback to hardcoded values or use supabase-config.js

const SUPABASE_CONFIG = {
  // Try environment variables first (set by Vercel/Netlify)
  // Then try window variables (if injected)
  // Finally fallback to placeholder (update with your actual values)
  url: typeof process !== 'undefined' && process.env?.SUPABASE_URL ||
       window.SUPABASE_URL || 
       'YOUR_SUPABASE_URL',
  
  anonKey: typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY ||
           window.SUPABASE_ANON_KEY || 
           'YOUR_SUPABASE_ANON_KEY'
};

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabaseClient, SUPABASE_CONFIG };
}

// Log configuration status (remove in production)
if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
  console.warn('⚠️ Supabase config not set. Please configure environment variables or update supabase-config-env.js');
}

