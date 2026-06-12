require('dotenv').config();
const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://api.football-data.org/v4/matches/537328', {
      headers: { 'X-Auth-Token': process.env.FIFA_API_KEY }
    });
    console.log("Match 537328 details from API:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
test();
