require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Fetching profiles...");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id');
  if (pErr) throw pErr;

  if (profiles.length === 0) {
    console.log("No profiles found. Nothing to migrate.");
    return;
  }

  // Use the first profile as the owner of the group
  const ownerId = profiles[0].id;

  console.log(`Creating "Fam. torres" group with owner ${ownerId}...`);
  // Generate random 6 char code
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: group, error: gErr } = await supabase
    .from('groups')
    .insert({
      name: 'Fam. torres',
      invite_code: inviteCode,
      owner_id: ownerId
    })
    .select()
    .single();

  if (gErr) throw gErr;
  console.log("Group created:", group);

  console.log(`Adding ${profiles.length} users to the group...`);
  const members = profiles.map(p => ({
    group_id: group.id,
    user_id: p.id
  }));

  const { error: mErr } = await supabase.from('group_members').insert(members);
  if (mErr) throw mErr;

  console.log("Migration successful! All users added to Fam. torres.");
  console.log("Invite code for Fam. torres:", inviteCode);
}

migrate().catch(console.error);
