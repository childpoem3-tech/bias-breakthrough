-- Create users table with consent tracking
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id TEXT UNIQUE,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  consent_given BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_info JSONB,
  completed BOOLEAN DEFAULT false
);

-- Create games metadata table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level_group TEXT NOT NULL CHECK (level_group IN ('beginner', 'intermediate', 'advanced')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create results table
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  inputs JSONB NOT NULL,
  outcome JSONB NOT NULL,
  score NUMERIC,
  time_taken_sec NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create events table for tracking
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = supabase_user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own data"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = supabase_user_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid() OR auth.uid() IS NULL));

CREATE POLICY "Users can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

-- RLS Policies for games (public read)
CREATE POLICY "Anyone can view games"
  ON public.games FOR SELECT
  USING (true);

-- RLS Policies for results
CREATE POLICY "Users can view their own results"
  ON public.results FOR SELECT
  USING (session_id IN (
    SELECT id FROM public.sessions WHERE user_id IN (
      SELECT id FROM public.users WHERE supabase_user_id = auth.uid() OR auth.uid() IS NULL
    )
  ));

CREATE POLICY "Users can insert results"
  ON public.results FOR INSERT
  WITH CHECK (true);

-- RLS Policies for events
CREATE POLICY "Users can view their own events"
  ON public.events FOR SELECT
  USING (session_id IN (
    SELECT id FROM public.sessions WHERE user_id IN (
      SELECT id FROM public.users WHERE supabase_user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create events"
  ON public.events FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial game data
INSERT INTO public.games (slug, name, level_group, description) VALUES
  ('dictator_v1', 'Dictator Game', 'beginner', 'Test your altruism by deciding how much to keep versus give away'),
  ('ultimatum_v1', 'Ultimatum Game', 'beginner', 'Propose a split - will the other player accept?'),
  ('delay_discounting_v1', 'Delay Discounting', 'beginner', 'Choose between immediate or delayed rewards'),
  ('prisoners_dilemma_v1', 'Prisoner''s Dilemma', 'intermediate', 'Cooperate or defect in this classic game theory scenario'),
  ('trust_game_v1', 'Trust & Betray', 'intermediate', 'Invest points and see if your partner returns the favor'),
  ('lottery_v1', 'Risk-Reward Lottery', 'intermediate', 'Choose between safe and risky options'),
  ('race_to_zero_v1', 'Race-to-Zero', 'advanced', 'Manage shared resources without depleting them'),
  ('framing_v1', 'Loss vs Gain Framing', 'advanced', 'See how framing affects your decisions'),
  ('social_comparison_v1', 'Social Comparison', 'advanced', 'Compare your payoff with others'),
  ('quantum_v1', 'Quantum Prisoner''s Dilemma', 'advanced', 'Make probabilistic decisions under uncertainty');

-- Create function to get active player counts
CREATE OR REPLACE FUNCTION public.get_active_players_by_game()
RETURNS TABLE (
  game_slug TEXT,
  game_name TEXT,
  active_count BIGINT,
  total_plays BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.slug,
    g.name,
    COUNT(DISTINCT CASE WHEN s.last_active_at > now() - interval '5 minutes' THEN s.id END) as active_count,
    COUNT(DISTINCT r.id) as total_plays
  FROM public.games g
  LEFT JOIN public.results r ON r.game_id = g.id
  LEFT JOIN public.sessions s ON s.id = r.session_id
  GROUP BY g.slug, g.name
  ORDER BY g.slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;