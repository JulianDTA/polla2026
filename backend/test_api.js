require('dotenv').config();
const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': process.env.FIFA_API_KEY },
      params: { season: 2026 }
    });
    const matches = res.data.matches;
    const mexico = matches.find(m => m.homeTeam?.name === 'Mexico' || m.awayTeam?.name === 'Mexico');
    console.log("Mexico match from API:");
    console.log(mexico.status, mexico.score);
  } catch (err) {
    console.error(err.message);
  }
}
test();
