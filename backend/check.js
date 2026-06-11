require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  const { data: matches } = await supabase.from('matches').select('id, home_team_name, away_team_name, match_date, status, home_score, away_score').order('match_date', { ascending: true }).limit(5);
  console.log("First 5 matches:", matches);
}

check().catch(console.error);
