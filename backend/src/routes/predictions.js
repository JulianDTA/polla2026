const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// All prediction routes require a logged-in user
router.use(authenticate);

/**
 * GET /api/predictions
 * Returns all predictions for the current user.
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*, matches(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

/**
 * POST /api/predictions
 * Create or update a prediction for a match.
 * Body: { match_id, predicted_home_score, predicted_away_score }
 */
router.post('/', async (req, res) => {
  const { match_id, predicted_home_score, predicted_away_score } = req.body;

  if (!match_id || predicted_home_score == null || predicted_away_score == null) {
    return res.status(400).json({ error: 'match_id, predicted_home_score, predicted_away_score are required' });
  }
  if (predicted_home_score < 0 || predicted_away_score < 0) {
    return res.status(400).json({ error: 'Scores must be non-negative' });
  }

  try {
    // Verify match exists and hasn't started
    const { data: match, error: matchErr } = await supabase
      .from('matches')
      .select('id, match_date, status')
      .eq('id', match_id)
      .single();

    if (matchErr || !match) return res.status(404).json({ error: 'Match not found' });

    const now = new Date();
    const matchDate = new Date(match.match_date);

    if (matchDate <= now || match.status !== 'upcoming') {
      return res.status(400).json({ error: 'Predictions are locked — match has already started' });
    }

    // Upsert prediction
    const { data, error } = await supabase
      .from('predictions')
      .upsert(
        {
          user_id:               req.user.id,
          match_id,
          predicted_home_score:  parseInt(predicted_home_score, 10),
          predicted_away_score:  parseInt(predicted_away_score, 10),
          updated_at:            new Date().toISOString(),
        },
        { onConflict: 'user_id,match_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('POST /predictions error:', err.message);
    res.status(500).json({ error: 'Failed to save prediction' });
  }
});

/**
 * GET /api/predictions/champion
 */
router.get('/champion', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('champion_predictions')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch champion prediction' });
  }
});

/**
 * POST /api/predictions/champion
 * Body: { predicted_champion, predicted_champion_flag }
 * Locked once the tournament has started (June 11 2026 15:00 UTC)
 */
router.post('/champion', async (req, res) => {
  const { predicted_champion, predicted_champion_flag = '' } = req.body;
  if (!predicted_champion) {
    return res.status(400).json({ error: 'predicted_champion is required' });
  }

  // Lock champion picks after the first match starts
  const TOURNAMENT_START = new Date('2026-06-17T22:00:00-05:00');
  if (new Date() >= TOURNAMENT_START) {
    return res.status(400).json({ error: 'Champion predictions are locked — tournament has started' });
  }

  try {
    const { data, error } = await supabase
      .from('champion_predictions')
      .upsert(
        {
          user_id:                  req.user.id,
          predicted_champion,
          predicted_champion_flag,
          updated_at:               new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('POST /predictions/champion error:', err.message);
    res.status(500).json({ error: 'Failed to save champion prediction' });
  }
});

/**
 * GET /api/predictions/match/:matchId
 * Get all predictions for a match by members of a specific group
 * Query: ?group_id=...
 */
router.get('/match/:matchId', async (req, res) => {
  const matchId = req.params.matchId;
  const groupId = req.query.group_id;

  if (!groupId) {
    return res.status(400).json({ error: 'group_id is required' });
  }

  try {
    // 1. Verify match status
    const { data: match, error: matchErr } = await supabase
      .from('matches')
      .select('status')
      .eq('id', matchId)
      .single();

    if (matchErr || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // ANTI-CHEAT RULE
    if (match.status === 'upcoming') {
      return res.status(403).json({ error: 'No puedes ver las predicciones de los demás hasta que inicie el partido.' });
    }

    // 2. Verify user is in the group
    const { data: membership, error: memErr } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', req.user.id)
      .single();

    if (memErr || !membership) {
      return res.status(403).json({ error: 'No perteneces a este grupo.' });
    }

    // 3. Fetch predictions of users in the group
    const { data, error } = await supabase
      .from('predictions')
      .select(`
        predicted_home_score,
        predicted_away_score,
        points_earned,
        profiles!inner(id, username, avatar_url, group_members!inner(group_id))
      `)
      .eq('match_id', matchId)
      .eq('profiles.group_members.group_id', groupId);

    if (error) throw error;

    // Map response to a clean format
    const formatted = data.map(p => ({
      username: p.profiles.username,
      avatar_url: p.profiles.avatar_url,
      predicted_home_score: p.predicted_home_score,
      predicted_away_score: p.predicted_away_score,
      points_earned: p.points_earned
    }));

    // Sort by points earned descending, then username
    formatted.sort((a, b) => {
      const ptsA = a.points_earned || 0;
      const ptsB = b.points_earned || 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      return a.username.localeCompare(b.username);
    });

    res.json(formatted);
  } catch (err) {
    console.error('GET /predictions/match error:', err.message);
    res.status(500).json({ error: 'Failed to fetch match predictions' });
  }
});

module.exports = router;
