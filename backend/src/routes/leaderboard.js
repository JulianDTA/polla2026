const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

/**
 * GET /api/leaderboard
 * Get leaderboard for a specific group
 */
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const groupId = req.query.group_id;

  if (!groupId) {
    return res.status(400).json({ error: 'group_id is required' });
  }

  try {
    const { data, error } = await supabase
      .from('group_leaderboard')
      .select('*')
      .eq('group_id', groupId)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
