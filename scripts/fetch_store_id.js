
require('dotenv').config({ path: '../.env' }); // Load ERP .env
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchStore() {
    const { data, error } = await supabase.from('stores').select('id, name').limit(1);
    if (error) {
        console.error("Error fetching store:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("Valid Store ID:", data[0].id);
        console.log("Store Name:", data[0].name);
    } else {
        console.log("No stores found.");
    }
}

fetchStore();
