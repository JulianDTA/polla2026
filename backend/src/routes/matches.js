const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/matches
 * Query params: stage, group
 * Returns matches + userPrediction if authenticated.
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { stage, group } = req.query;

    let query = supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (stage) query = query.eq('stage', stage);
    if (group) query = query.eq('group_name', group.toUpperCase());

    const { data: matches, error } = await query;
    if (error) throw error;

    if (req.user) {
      const { data: preds } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', req.user.id);

      const predMap = Object.fromEntries((preds || []).map(p => [p.match_id, p]));
      return res.json(matches.map(m => ({ ...m, userPrediction: predMap[m.id] || null })));
    }

    res.json(matches);
  } catch (err) {
    console.error('GET /matches error:', err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

/**
 * GET /api/matches/standings
 * Returns cached group standings from Supabase.
 * (Populated by admin sync)
 */
router.get('/standings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('group_name, home_team_name, home_team_flag, away_team_name, away_team_flag, home_score, away_score, status, match_date')
      .eq('stage', 'group')
      .order('match_date', { ascending: true });

    if (error) throw error;

    // Build standings table from finished group matches
    const groups = {};
    for (const m of data) {
      const g = m.group_name || '?';
      if (!groups[g]) groups[g] = {};

      const initTeam = (name, flag) => {
        if (!groups[g][name]) groups[g][name] = { name, flag, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
      };

      initTeam(m.home_team_name, m.home_team_flag);
      initTeam(m.away_team_name, m.away_team_flag);

      if (m.status === 'finished' && m.home_score !== null) {
        const ht = groups[g][m.home_team_name];
        const at = groups[g][m.away_team_name];

        ht.played++; at.played++;
        ht.gf += m.home_score; ht.ga += m.away_score;
        at.gf += m.away_score; at.ga += m.home_score;

        if (m.home_score > m.away_score) { ht.won++; ht.pts += 3; at.lost++; }
        else if (m.home_score < m.away_score) { at.won++; at.pts += 3; ht.lost++; }
        else { ht.drawn++; ht.pts++; at.drawn++; at.pts++; }
      }
    }

    // Sort each group by pts desc, then GD desc
    const result = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([name, teams]) => ({
      group: name,
      teams: Object.values(teams)
        .map(t => ({ ...t, gd: t.gf - t.ga }))
        .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf),
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /matches/standings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

/**
 * GET /api/matches/teams
 * Return distinct teams with their flags.
 */
router.get('/teams', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('home_team_id, home_team_name, home_team_flag')
      .order('home_team_name', { ascending: true });

    if (error) throw error;

    const seen = new Set();
    const teams = [];
    for (const m of data) {
      if (!seen.has(m.home_team_id)) {
        seen.add(m.home_team_id);
        teams.push({ id: m.home_team_id, name: m.home_team_name, flag: m.home_team_flag });
      }
    }
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

/**
 * GET /api/matches/:id
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Match not found' });

    if (req.user) {
      const { data: pred } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('match_id', data.id)
        .maybeSingle();
      return res.json({ ...data, userPrediction: pred || null });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

module.exports = router;
