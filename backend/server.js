require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const matchesRouter     = require('./src/routes/matches');
const predictionsRouter = require('./src/routes/predictions');
const leaderboardRouter = require('./src/routes/leaderboard');
const adminRouter       = require('./src/routes/admin');
const groupsRouter      = require('./src/routes/groups');

const app  = express();
app.set('trust proxy', 1); // Confiar en el proxy de Vercel para express-rate-limit
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      origin.endsWith('.vercel.app') || 
      origin === process.env.FRONTEND_URL
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again shortly' },
}));

// ── Routes ───────────────────────────────────────────────────
const apiRouter = express.Router();
apiRouter.use('/matches',     matchesRouter);
apiRouter.use('/predictions', predictionsRouter);
apiRouter.use('/leaderboard', leaderboardRouter);
apiRouter.use('/admin',       adminRouter);

app.use('/api', apiRouter);
app.use('/',    apiRouter); // Fallback por si en el frontend olvidan poner /api

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Local dev: start server + crons ──────────────────────────
// On Vercel (serverless) module.parent is set, so we skip listen/cron
if (!process.env.VERCEL) {
  const cron  = require('node-cron');
  const axios = require('axios');

  // Sync live scores every 2 min during tournament
  cron.schedule('*/2 * * * *', async () => {
    const now   = new Date();
    const start = new Date('2026-06-11');
    const end   = new Date('2026-07-20');
    if (now < start || now > end) return;
    try {
      await axios.post(
        `http://localhost:${PORT}/api/admin/sync-live`,
        {},
        { headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY } }
      );
    } catch (e) {
      console.error('[Cron] Live sync error:', e.message);
    }
  });

  // Recalculate points every 10 min
  cron.schedule('*/10 * * * *', async () => {
    try {
      await axios.post(
        `http://localhost:${PORT}/api/admin/calculate-points`,
        {},
        { headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY } }
      );
    } catch (e) {
      console.error('[Cron] Points error:', e.message);
    }
  });

  app.listen(PORT, async () => {
    console.log(`🌍 Polla Mundialista backend running on port ${PORT}`);

    // Auto-sync if matches table is empty
    try {
      const supabase = require('./src/config/supabase');
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });
      if (error) return;
      if (count === 0) {
        console.log('[Startup] matches table is empty — syncing...');
        await axios.post(
          `http://localhost:${PORT}/api/admin/sync`,
          {},
          { headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY } }
        );
        console.log('[Startup] Initial sync complete ✓');
      } else {
        console.log(`[Startup] ${count} matches in DB — skipping auto-sync`);
      }
    } catch (e) {
      console.warn('[Startup] Auto-sync check failed:', e.message);
    }
  });
}

// Export for Vercel serverless
module.exports = app;
