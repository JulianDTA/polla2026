require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const cron       = require('node-cron');
const axios      = require('axios');

const matchesRouter     = require('./src/routes/matches');
const predictionsRouter = require('./src/routes/predictions');
const leaderboardRouter = require('./src/routes/leaderboard');
const adminRouter       = require('./src/routes/admin');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());

app.use(rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again shortly' },
}));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/matches',     matchesRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin',       adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Scheduled jobs ───────────────────────────────────────────
// Sync live scores every 2 minutes during tournament (June 11 – July 19 2026)
// This calls the /api/admin/sync-live endpoint internally.
cron.schedule('*/2 * * * *', async () => {
  const today = new Date();
  const start = new Date('2026-06-11');
  const end   = new Date('2026-07-20');
  if (today < start || today > end) return;

  try {
    await axios.post(
      `http://localhost:${PORT}/api/admin/sync-live`,
      {},
      { headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY } }
    );
    console.log('[Cron] Live sync triggered');
  } catch (err) {
    console.error('[Cron] Live sync error:', err.message);
  }
});

// Recalculate points every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    await axios.post(
      `http://localhost:${PORT}/api/admin/calculate-points`,
      {},
      { headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY } }
    );
  } catch (err) {
    console.error('[Cron] Calculate-points error:', err.message);
  }
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🌍 Polla Mundialista backend running on port ${PORT}`);

  // Auto-sync fixtures on startup if the matches table is empty
  try {
    const supabase = require('./src/config/supabase');
    const { count, error } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('[Startup] Could not check matches table:', error.message);
      return;
    }

    if (count === 0) {
      console.log('[Startup] matches table is empty — running first-time sync from worldcupapi.com...');
      try {
        await axios.post(
          `http://localhost:${PORT}/api/admin/sync`,
          {},
          { headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY } }
        );
        console.log('[Startup] Initial sync complete ✓');
      } catch (syncErr) {
        console.error('[Startup] Sync failed:', syncErr.message);
        console.log('[Startup] Tip: run the seed_matches.sql in Supabase SQL Editor as a fallback.');
      }
    } else {
      console.log(`[Startup] matches table has ${count} matches — skipping auto-sync`);
    }
  } catch (e) {
    console.warn('[Startup] Auto-sync check failed:', e.message);
  }
});
