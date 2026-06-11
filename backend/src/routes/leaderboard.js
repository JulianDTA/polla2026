const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

/**
 * GET /api/leaderboard
 * Returns the leaderboard view (all users sorted by total_points).
 * Optional query param: limit (default 50)
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
