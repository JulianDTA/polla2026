const { createClient } = require('@supabase/supabase-js');

// Anon client — only used to verify user JWTs
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Require a valid Supabase JWT.
 * Attaches req.user on success.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No auth token' });
  }
  const token = header.slice(7);
  try {
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    req.user  = user;
    req.token = token;
    next();
  } catch {
    res.status(401).json({ error: 'Auth failed' });
  }
};

/**
 * Same as authenticate but doesn't block unauthenticated requests.
 * req.user will be null for anonymous visitors.
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  req.user = null;
  if (!header.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  try {
    const { data: { user } } = await supabaseAnon.auth.getUser(token);
    req.user  = user || null;
    req.token = token;
  } catch { /* ignore */ }
  next();
};

/**
 * Protect admin-only routes.
 * Accepts either:
 *  - x-admin-key header  (manual calls / local dev cron)
 *  - Authorization: Bearer <CRON_SECRET>  (Vercel cron jobs)
 */
const adminAuth = (req, res, next) => {
  const key        = req.headers['x-admin-key'];
  const authHdr    = req.headers['authorization'] || '';
  const cronSecret = process.env.CRON_SECRET;

  const validAdmin = key && key === process.env.ADMIN_SECRET_KEY;
  const validCron  = cronSecret && authHdr === `Bearer ${cronSecret}`;

  if (!validAdmin && !validCron) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, optionalAuth, adminAuth };
