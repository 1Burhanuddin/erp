
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listStores() {
    const { data, error } = await supabase.from('stores').select('id, name');
    if (error) {
        console.error("Error fetching stores:", error);
        return;
    }
    console.log("Available Stores:");
    data.forEach(store => {
        console.log(`- Name: ${store.name}, ID: ${store.id}`);
    });
}

listStores();
