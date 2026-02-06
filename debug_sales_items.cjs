
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/home/burhanuddin/Projects/erp/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    const { data, error } = await supabase
        .from('sales_items')
        .select('id, sale_id, product_id, tax_rate_id, tax_amount')
        .limit(10);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Sales Items Data:", JSON.stringify(data, null, 2));
    }
}

checkData();
