require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  const { data: matches } = await supabase.from('matches').select('id, home_team_name, away_team_name, venue, city, match_date');
  const withVenues = matches.filter(m => m.venue || m.city);
  console.log("Matches with venues:", withVenues.length);
  if (withVenues.length > 0) {
    console.log("Sample:", withVenues[0]);
  }
}
check();
