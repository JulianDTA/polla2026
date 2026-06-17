-- Add at the end of the tables section
CREATE TABLE IF NOT EXISTS public.groups (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  invite_code TEXT        UNIQUE NOT NULL,
  owner_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_select_all" ON public.groups FOR SELECT USING (true);
CREATE POLICY "groups_insert_auth" ON public.groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "groups_update_owner" ON public.groups FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "members_select_all" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "members_insert_auth" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members_delete_own" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE TRIGGER groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Replace leaderboard with group_leaderboard
DROP VIEW IF EXISTS public.leaderboard;

CREATE OR REPLACE VIEW public.group_leaderboard AS
SELECT
  gm.group_id,
  p.id as user_id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.total_points,
  COUNT(DISTINCT pred.id) FILTER (WHERE pred.points_earned IS NOT NULL) AS matches_predicted,
  COUNT(DISTINCT pred.id) FILTER (WHERE pred.points_earned = 3) AS exact_scores,
  COUNT(DISTINCT pred.id) FILTER (WHERE pred.points_earned = 1) AS correct_results,
  COALESCE(cp.predicted_champion, '') AS champion_pick,
  COALESCE(cp.points_earned, 0) AS champion_points,
  RANK() OVER (PARTITION BY gm.group_id ORDER BY p.total_points DESC, COUNT(pred.id) FILTER (WHERE pred.points_earned = 3) DESC) AS rank
FROM public.profiles p
JOIN public.group_members gm ON gm.user_id = p.id
LEFT JOIN public.predictions pred ON pred.user_id = p.id
LEFT JOIN public.champion_predictions cp ON cp.user_id = p.id
GROUP BY gm.group_id, p.id, p.username, p.full_name, p.avatar_url, p.total_points, cp.predicted_champion, cp.points_earned;
