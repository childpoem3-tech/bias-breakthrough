import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MULTIPLIER_TIERS = [
  { minStreak: 1, multiplier: 1.0 },
  { minStreak: 3, multiplier: 1.25 },
  { minStreak: 7, multiplier: 1.5 },
  { minStreak: 14, multiplier: 1.75 },
  { minStreak: 30, multiplier: 2.0 },
  { minStreak: 60, multiplier: 2.5 },
  { minStreak: 100, multiplier: 3.0 },
];

export function useStreakMultiplier() {
  const { user } = useAuth();
  const [multiplier, setMultiplier] = useState(1.0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStreak();
    else setLoading(false);
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_user_id', user.id)
        .maybeSingle();

      if (!userData) { setLoading(false); return; }

      const { data: events } = await supabase
        .from('events')
        .select('timestamp, payload')
        .eq('event_type', 'daily_login')
        .order('timestamp', { ascending: false })
        .limit(100);

      const userEvents = events?.filter(e => {
        const payload = e.payload as any;
        return payload?.user_id === userData.id;
      }) || [];

      const loginDates = [...new Set(
        userEvents.map(e => new Date(e.timestamp).toISOString().split('T')[0])
      )].sort().reverse();

      const today = new Date().toISOString().split('T')[0];
      let currentStreak = loginDates.includes(today) ? 1 : 0;

      const checkDate = new Date();
      if (loginDates.includes(today)) checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (loginDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }

      const tier = [...MULTIPLIER_TIERS].reverse().find(t => currentStreak >= t.minStreak) || MULTIPLIER_TIERS[0];
      setStreak(currentStreak);
      setMultiplier(tier.multiplier);
    } catch (e) {
      console.error('Error loading streak multiplier:', e);
    } finally {
      setLoading(false);
    }
  };

  const applyMultiplier = useCallback((baseScore: number) => {
    return Math.round(baseScore * multiplier);
  }, [multiplier]);

  return { multiplier, streak, loading, applyMultiplier };
}
