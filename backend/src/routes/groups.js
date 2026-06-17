const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.createElement ? express.Router() : express.Router(); // Using Router
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get user's groups
router.get('/mine', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, groups ( id, name, invite_code, owner_id )')
      .eq('user_id', user.id);

    if (error) throw error;
    
    // Flatten response
    const groups = data.map(m => m.groups).filter(Boolean);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    let inviteCode = generateInviteCode();
    // In a real scenario, you'd check for collision

    // Create group
    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert({ name, invite_code: inviteCode, owner_id: user.id })
      .select()
      .single();

    if (gErr) throw gErr;

    // Add creator to group
    const { error: mErr } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id });

    if (mErr) throw mErr;

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join a group by code
router.post('/join', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let { invite_code } = req.body;
  if (!invite_code) return res.status(400).json({ error: 'Invite code is required' });
  invite_code = invite_code.toUpperCase().trim();

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    // Find group
    const { data: group, error: gErr } = await supabase
      .from('groups')
      .select('id, name')
      .eq('invite_code', invite_code)
      .single();

    if (gErr || !group) {
      return res.status(404).json({ error: 'Invalid invite code or group not found' });
    }

    // Check if already member
    const { data: existing, error: eErr } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Ya eres miembro de este grupo' });
    }

    // Join
    const { error: mErr } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id });

    if (mErr) throw mErr;

    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leave a group
router.post('/leave', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { group_id } = req.body;
  if (!group_id) return res.status(400).json({ error: 'group_id is required' });

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    // Check if the user is the owner
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', group_id)
      .single();

    if (group && group.owner_id === user.id) {
      return res.status(400).json({ error: 'El creador del grupo no puede abandonarlo.' });
    }

    const { error: dErr } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group_id)
      .eq('user_id', user.id);

    if (dErr) throw dErr;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
