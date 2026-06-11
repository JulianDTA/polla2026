const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');
const fifaApi  = require('../config/fifaApi');
const { adminAuth } = require('../middleware/auth');

// All admin routes are protected by the shared secret
router.use(adminAuth);

/**
 * POST /api/admin/sync
 * Fetches all fixtures from FIFA API and upserts them into the matches table.
 */
router.post('/sync', async (req, res) => {
  try {
    console.log('[Admin] Syncing fixtures from worldcupapi.com…');
    const fixtures = await fifaApi.getAllFixtures();

    if (!fixtures.length) {
      return res.status(200).json({ synced: 0, message: 'No fixtures returned from API' });
    }

    const BATCH = 50;
    let total = 0;
    for (let i = 0; i < fixtures.length; i += BATCH) {
      const batch = fixtures.slice(i, i + BATCH);
      const { error } = await supabase
        .from('matches')
        .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: false });
      if (error) throw error;
      total += batch.length;
    }

    console.log(`[Admin] Sync complete — ${total} matches upserted`);
    res.json({ synced: total, message: `${total} matches synced successfully` });
  } catch (err) {
    console.error('[Admin] Sync error:', err.message);
    res.status(500).json({ error: `Sync failed: ${err.message}` });
  }
});

/**
 * POST /api/admin/sync-live
 * Fetches only live/finished fixtures and updates their scores/status.
 * Uses targeted UPDATE so only score/status fields change.
 */
router.post('/sync-live', async (req, res) => {
  try {
    const liveMatches = await fifaApi.getLiveFixtures();

    if (!liveMatches.length) {
      return res.json({ updated: 0, message: 'No live matches right now' });
    }

    let updated = 0;
    for (const m of liveMatches) {
      const { error } = await supabase
        .from('matches')
        .update({
          status:     m.status,
          home_score: m.home_score,
          away_score: m.away_score,
          updated_at: m.updated_at,
        })
        .eq('external_id', m.external_id);

      if (error) {
        console.error(`[Admin] Live update failed for ${m.external_id}:`, error.message);
      } else {
        updated++;
      }
    }

    // Auto-calculate points for finished matches
    const { data: finMatches } = await supabase.from('matches').select('id').eq('status', 'finished');
    if (finMatches && finMatches.length) {
      for (const match of finMatches) {
        await supabase.rpc('calculate_match_points', { p_match_id: match.id });
      }
    }

    res.json({ updated, total: liveMatches.length });
  } catch (err) {
    console.error('[Admin] Sync-live error:', err.message);
    res.status(500).json({ error: `Live sync failed: ${err.message}` });
  }
});

/**
 * POST /api/admin/calculate-points
 * Calculates points for all finished matches.
 */
router.post('/calculate-points', async (req, res) => {
  try {
    const { data: matches, error: mErr } = await supabase
      .from('matches')
      .select('id')
      .eq('status', 'finished');

    if (mErr) throw mErr;
    if (!matches.length) return res.json({ calculated: 0, message: 'No finished matches found' });

    let calculated = 0;
    for (const match of matches) {
      const { data, error } = await supabase.rpc('calculate_match_points', { p_match_id: match.id });
      if (!error && data > 0) calculated += data;
    }

    res.json({ calculated, message: `Points calculated for ${calculated} prediction(s)` });
  } catch (err) {
    console.error('[Admin] Calculate-points error:', err.message);
    res.status(500).json({ error: `Points calculation failed: ${err.message}` });
  }
});

/**
 * POST /api/admin/award-champion-points
 * Awards 5 points to users who correctly predicted the champion.
 * Body: { winner: "Team Name" }
 */
router.post('/award-champion-points', async (req, res) => {
  const { winner } = req.body;
  if (!winner) return res.status(400).json({ error: 'winner is required' });

  try {
    await supabase
      .from('champion_predictions')
      .update({ points_earned: 0 });

    const { data, error } = await supabase
      .from('champion_predictions')
      .update({ points_earned: 5 })
      .ilike('predicted_champion', winner)
      .select('user_id');

    if (error) throw error;

    for (const row of (data || [])) {
      await supabase.rpc('refresh_user_points', { p_user_id: row.user_id });
    }

    res.json({ awarded: (data || []).length, winner });
  } catch (err) {
    console.error('[Admin] Award-champion-points error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Vercel Cron GET endpoints ────────────────────────────────
// Vercel cron jobs always make GET requests. Protected by
// Authorization: Bearer <CRON_SECRET> (same adminAuth middleware).

router.get('/cron/sync-live', async (req, res) => {
  try {
    const liveMatches = await fifaApi.getLiveFixtures();
    if (!liveMatches.length) {
      return res.json({ updated: 0, message: 'No live matches right now' });
    }
    let updated = 0;
    for (const m of liveMatches) {
      const { error } = await supabase
        .from('matches')
        .update({ status: m.status, home_score: m.home_score, away_score: m.away_score, updated_at: m.updated_at })
        .eq('external_id', m.external_id);
      if (!error) updated++;
    }
    // Auto-calculate points for finished matches
    const { data: finMatches } = await supabase.from('matches').select('id').eq('status', 'finished');
    if (finMatches && finMatches.length) {
      for (const match of finMatches) {
        await supabase.rpc('calculate_match_points', { p_match_id: match.id });
      }
    }

    console.log('[Cron] sync-live: ' + updated + ' updated');
    res.json({ updated, total: liveMatches.length });
  } catch (err) {
    console.error('[Cron] sync-live error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/cron/calculate-points', async (req, res) => {
  try {
    const { data: matches, error: mErr } = await supabase
      .from('matches')
      .select('id')
      .eq('status', 'finished');
    if (mErr) throw mErr;
    if (!matches || !matches.length) return res.json({ calculated: 0 });

    let calculated = 0;
    for (const match of matches) {
      const { data, error } = await supabase.rpc('calculate_match_points', { p_match_id: match.id });
      if (!error && data > 0) calculated += data;
    }
    console.log('[Cron] calculate-points: ' + calculated);
    res.json({ calculated });
  } catch (err) {
    console.error('[Cron] calculate-points error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
