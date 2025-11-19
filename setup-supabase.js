#!/usr/bin/env node
/**
 * Supabase Setup Script
 * 
 * This script helps configure Supabase for your project.
 * Run: node setup-supabase.js
 * 
 * Or provide credentials directly:
 * node setup-supabase.js --url YOUR_URL --key YOUR_KEY
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupSupabase() {
  console.log('\n🚀 Supabase Setup for STIF Project\n');
  console.log('This script will help you configure Supabase integration.\n');
  
  // Check for command line arguments
  const args = process.argv.slice(2);
  let url = null;
  let key = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      url = args[i + 1];
    }
    if (args[i] === '--key' && args[i + 1]) {
      key = args[i + 1];
    }
  }
  
  // Get credentials
  if (!url) {
    url = await question('Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co): ');
  }
  if (!key) {
    key = await question('Enter your Supabase anon/public key: ');
  }
  
  // Validate
  if (!url || url === 'YOUR_SUPABASE_URL' || !url.includes('supabase.co')) {
    console.error('❌ Invalid Supabase URL');
    rl.close();
    process.exit(1);
  }
  
  if (!key || key === 'YOUR_SUPABASE_ANON_KEY' || key.length < 50) {
    console.error('❌ Invalid Supabase anon key');
    rl.close();
    process.exit(1);
  }
  
  // Update supabase-config.js
  const configPath = path.join(__dirname, 'supabase-config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Replace the fallback values
  configContent = configContent.replace(
    /url: 'YOUR_SUPABASE_URL'/g,
    `url: '${url}'`
  );
  configContent = configContent.replace(
    /anonKey: 'YOUR_SUPABASE_ANON_KEY'/g,
    `anonKey: '${key}'`
  );
  
  fs.writeFileSync(configPath, configContent);
  
  console.log('\n✅ Supabase configuration updated!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to your Supabase dashboard → SQL Editor');
  console.log('2. Open supabase-schema.sql from this project');
  console.log('3. Copy and paste the SQL into the editor and run it');
  console.log('4. (Optional) Set environment variables in Vercel:');
  console.log('   - SUPABASE_URL = ' + url);
  console.log('   - SUPABASE_ANON_KEY = ' + key.substring(0, 20) + '...');
  console.log('\n✨ Setup complete!\n');
  
  rl.close();
}

setupSupabase().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});

