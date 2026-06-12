require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  const { data: match } = await supabase
    .from('matches')
    .select('id, home_team_name, away_team_name, home_score, away_score, status')
    .eq('home_team_name', 'South Korea')
    .single();

  if (!match) {
    console.log("Match not found");
    return;
  }

  console.log("Match:", match);

  const { data: predictions, error } = await supabase
    .from('predictions')
    .select(`
      predicted_home_score,
      predicted_away_score,
      points_earned,
      profiles ( username )
    `)
    .eq('match_id', match.id);

  if (error) {
    console.error(error);
  } else {
    console.log("Predictions:", JSON.stringify(predictions, null, 2));
  }
}

check().catch(console.error);
