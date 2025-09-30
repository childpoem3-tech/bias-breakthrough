-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Fix search_path for get_active_players_by_game function
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;