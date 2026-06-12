require('dotenv').config();
const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': process.env.FIFA_API_KEY },
      params: { season: 2026 }
    });
    const matches = res.data.matches;
    const match = matches.find(m => m.homeTeam?.name === 'South Korea' || m.awayTeam?.name === 'South Korea');
    console.log("South Korea match from API:");
    console.log(match.status, match.score);
  } catch (err) {
    console.error(err.message);
  }
}
test();
