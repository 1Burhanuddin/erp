
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("Missing Supabase credentials in .env");
    // Try hardcoded fallback from asvac .env just in case
    // process.env.VITE_SUPABASE_URL = ...
}

console.log("Connecting to:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchStore() {
    const { data, error } = await supabase.from('stores').select('id, name').limit(1);
    if (error) {
        console.error("Error fetching store:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("VALID_STORE_ID:", data[0].id);
        console.log("STORE_NAME:", data[0].name);
    } else {
        console.log("No stores found.");
    }
}

fetchStore();
