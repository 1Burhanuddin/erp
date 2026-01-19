const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl); // Debug

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Fetching Stores...");
    // Try to select ID and Name
    const { data: stores, error: storesError } = await supabase.from('stores').select('*');
    if (storesError) console.error("Stores Error:", storesError);
    else {
        console.log(`Found ${stores.length} stores:`);
        console.table(stores);
    }

    console.log("\nFetching Employees...");
    // Select relevant fields
    const { data: employees, error: empError } = await supabase.from('employees').select('id, full_name, store_id, role');
    if (empError) console.error("Employees Error:", empError);
    else {
        console.log(`Found ${employees.length} employees:`);
        console.table(employees);
    }
}

main();
