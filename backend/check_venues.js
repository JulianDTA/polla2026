require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  const { data: matches } = await supabase.from('matches').select('id, home_team_name, away_team_name, venue, city, match_date').limit(5);
  console.log("Matches:", JSON.stringify(matches, null, 2));
}
check();
