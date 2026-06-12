const axios = require('axios');

async function trigger() {
  try {
    const res = await axios.get('https://pollaapi.vercel.app/api/admin/cron/sync-live', {
      headers: {
        'Authorization': 'Bearer CR0N-S3CR3T-P0LL4P1'
      }
    });
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (err) {
    console.error("Error Status:", err.response?.status);
    console.error("Error Data:", err.response?.data);
    console.error("Message:", err.message);
  }
}
trigger();
