-- ================================================================
-- POLLA MUNDIALISTA 2026 - Supabase Schema
-- Run this in the Supabase SQL editor
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLES
-- ================================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT        UNIQUE NOT NULL,
  full_name   TEXT        DEFAULT '',
  avatar_url  TEXT        DEFAULT '',
  total_points INTEGER    DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Matches (synced from FIFA API via backend)
CREATE TABLE IF NOT EXISTS public.matches (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id     TEXT        UNIQUE NOT NULL,         -- FIFA API fixture id
  home_team_id    TEXT,
  home_team_name  TEXT        NOT NULL,
  home_team_flag  TEXT        DEFAULT '',              -- URL to team logo/flag
  away_team_id    TEXT,
  away_team_name  TEXT        NOT NULL,
  away_team_flag  TEXT        DEFAULT '',
  home_score      INTEGER,                             -- NULL until match finishes
  away_score      INTEGER,
  match_date      TIMESTAMPTZ NOT NULL,
  stage           TEXT        NOT NULL DEFAULT 'group', -- group | round_of_32 | round_of_16 | quarter_final | semi_final | third_place | final
  group_name      TEXT,                                -- A–L for group stage
  venue           TEXT        DEFAULT '',
  city            TEXT        DEFAULT '',
  status          TEXT        NOT NULL DEFAULT 'upcoming', -- upcoming | live | finished
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions (one per user per match)
CREATE TABLE IF NOT EXISTS public.predictions (
  id                    UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id              UUID    NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home_score  INTEGER NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score  INTEGER NOT NULL CHECK (predicted_away_score >= 0),
  points_earned         INTEGER DEFAULT NULL,           -- NULL = not yet calculated
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Champion predictions (one per user)
CREATE TABLE IF NOT EXISTS public.champion_predictions (
  id                        UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID    NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  predicted_champion        TEXT    NOT NULL,
  predicted_champion_flag   TEXT    DEFAULT '',
  points_earned             INTEGER DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.champion_predictions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Matches (public read; only service role can write)
CREATE POLICY "matches_select_all"    ON public.matches  FOR SELECT USING (true);

-- Predictions (public read for leaderboard; user can only write own)
CREATE POLICY "predictions_select_all"  ON public.predictions FOR SELECT USING (true);
CREATE POLICY "predictions_insert_own"  ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own"  ON public.predictions FOR UPDATE USING (auth.uid() = user_id);

-- Champion predictions
CREATE POLICY "champion_select_all"   ON public.champion_predictions FOR SELECT USING (true);
CREATE POLICY "champion_insert_own"   ON public.champion_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "champion_update_own"   ON public.champion_predictions FOR UPDATE USING (auth.uid() = user_id);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1) || '_' || floor(random() * 9999)::text
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recalculate user total_points
CREATE OR REPLACE FUNCTION public.refresh_user_points(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_points = (
      SELECT COALESCE(SUM(points_earned), 0)
      FROM public.predictions
      WHERE user_id = p_user_id AND points_earned IS NOT NULL
    ) + (
      SELECT COALESCE(SUM(points_earned), 0)
      FROM public.champion_predictions
      WHERE user_id = p_user_id
    ),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Calculate points for a finished match
-- Call this from the backend after updating match scores
CREATE OR REPLACE FUNCTION public.calculate_match_points(p_match_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_home_score  INTEGER;
  v_away_score  INTEGER;
  v_actual_result TEXT;
  v_pred_result   TEXT;
  v_points        INTEGER;
  v_user_id       UUID;
  v_updated       INTEGER := 0;
BEGIN
  -- Get actual scores
  SELECT home_score, away_score
  INTO v_home_score, v_away_score
  FROM public.matches
  WHERE id = p_match_id AND status = 'finished';

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Determine actual result
  v_actual_result := CASE
    WHEN v_home_score > v_away_score THEN 'home'
    WHEN v_home_score < v_away_score THEN 'away'
    ELSE 'draw'
  END;

  -- Update points for each prediction on this match
  FOR v_user_id, v_pred_result IN
    SELECT
      user_id,
      CASE
        WHEN predicted_home_score > predicted_away_score THEN 'home'
        WHEN predicted_home_score < predicted_away_score THEN 'away'
        ELSE 'draw'
      END
    FROM public.predictions
    WHERE match_id = p_match_id
  LOOP
    -- Check for exact score first
    SELECT CASE
      WHEN predicted_home_score = v_home_score AND predicted_away_score = v_away_score THEN 3
      WHEN (CASE WHEN predicted_home_score > predicted_away_score THEN 'home'
                 WHEN predicted_home_score < predicted_away_score THEN 'away'
                 ELSE 'draw' END) = v_actual_result THEN 1
      ELSE 0
    END
    INTO v_points
    FROM public.predictions
    WHERE user_id = v_user_id AND match_id = p_match_id;

    UPDATE public.predictions
    SET points_earned = v_points, updated_at = NOW()
    WHERE user_id = v_user_id AND match_id = p_match_id;

    -- Refresh user total
    PERFORM public.refresh_user_points(v_user_id);
    v_updated := v_updated + 1;
  END LOOP;

  RETURN v_updated;
END;
$$;

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER champion_updated_at
  BEFORE UPDATE ON public.champion_predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ================================================================
-- LEADERBOARD VIEW
-- ================================================================

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.total_points,
  COUNT(DISTINCT pred.id) FILTER (WHERE pred.points_earned IS NOT NULL)                    AS matches_predicted,
  COUNT(DISTINCT pred.id) FILTER (WHERE pred.points_earned = 3)                            AS exact_scores,
  COUNT(DISTINCT pred.id) FILTER (WHERE pred.points_earned = 1)                            AS correct_results,
  COALESCE(cp.predicted_champion, '')                                                       AS champion_pick,
  COALESCE(cp.points_earned, 0)                                                             AS champion_points,
  RANK() OVER (ORDER BY p.total_points DESC, COUNT(pred.id) FILTER (WHERE pred.points_earned = 3) DESC) AS rank
FROM public.profiles p
LEFT JOIN public.predictions pred ON pred.user_id = p.id
LEFT JOIN public.champion_predictions cp ON cp.user_id = p.id
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.total_points, cp.predicted_champion, cp.points_earned
ORDER BY p.total_points DESC;
