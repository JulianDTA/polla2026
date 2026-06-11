require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  const { data: matches } = await supabase.from('matches').select('id, status, home_score, away_score').eq('home_team_name', 'Mexico').limit(1);
  console.log("Match:", matches);

  if (matches && matches.length > 0) {
    const { data: predictions } = await supabase.from('predictions').select('*').eq('match_id', matches[0].id).limit(5);
    console.log("Predictions for Mexico match:", predictions);
  }

  const { data: profiles } = await supabase.from('profiles').select('id, username, total_points').limit(3);
  console.log("Profiles:", profiles);
}

check().catch(console.error);
