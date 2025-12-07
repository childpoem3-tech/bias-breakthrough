import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Star, Gift, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  multiplier: number;
  todayCheckedIn: boolean;
}

const MULTIPLIER_TIERS = [
  { minStreak: 1, multiplier: 1.0, label: 'Base' },
  { minStreak: 3, multiplier: 1.25, label: '25% Bonus' },
  { minStreak: 7, multiplier: 1.5, label: '50% Bonus' },
  { minStreak: 14, multiplier: 1.75, label: '75% Bonus' },
  { minStreak: 30, multiplier: 2.0, label: '2x Bonus' },
  { minStreak: 60, multiplier: 2.5, label: '2.5x Bonus' },
  { minStreak: 100, multiplier: 3.0, label: '3x Bonus' },
];

const FireParticle = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(255,165,0,0.9) 0%, rgba(255,69,0,0.6) 50%, transparent 100%)`,
      filter: 'blur(1px)',
    }}
    initial={{ 
      y: 0, 
      x: Math.random() * 20 - 10,
      opacity: 0,
      scale: 0.5
    }}
    animate={{ 
      y: [-5, -30, -50],
      x: [null, Math.random() * 30 - 15, Math.random() * 40 - 20],
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.2]
    }}
    transition={{
      duration: 1.2 + Math.random() * 0.5,
      delay: delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
  />
);

const FlameIcon = ({ streak, size = 'md' }: { streak: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const getFlameColor = () => {
    if (streak >= 30) return 'from-blue-400 via-purple-500 to-pink-500';
    if (streak >= 14) return 'from-yellow-400 via-orange-500 to-red-600';
    if (streak >= 7) return 'from-orange-400 via-orange-500 to-red-500';
    if (streak >= 3) return 'from-yellow-400 via-orange-400 to-orange-500';
    return 'from-yellow-300 via-yellow-400 to-orange-400';
  };

  return (
    <motion.div 
      className="relative flex items-center justify-center"
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        duration: 0.8, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute ${sizeClasses[size]} rounded-full bg-gradient-to-t ${getFlameColor()} blur-xl opacity-50`}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      {/* Fire particles */}
      {streak >= 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(streak >= 7 ? 8 : 4)].map((_, i) => (
            <FireParticle 
              key={i} 
              delay={i * 0.15} 
              size={streak >= 14 ? 8 : 5}
            />
          ))}
        </div>
      )}
      
      {/* Main flame icon */}
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={{ 
          rotate: [-2, 2, -2],
        }}
        transition={{ 
          duration: 0.3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <Flame 
          className={`${sizeClasses[size]} text-transparent bg-gradient-to-t ${getFlameColor()} bg-clip-text`}
          style={{ 
            fill: 'url(#flameGradient)',
            stroke: 'none'
          }}
        />
        <svg width="0" height="0">
          <defs>
            <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF4500" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
          </defs>
        </svg>
        <Flame 
          className={`${sizeClasses[size]} absolute inset-0`}
          style={{ 
            fill: 'url(#flameGradient)',
            stroke: 'none',
            filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.8))'
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export function DailyStreak() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    multiplier: 1.0,
    todayCheckedIn: false
  });
  const [showReward, setShowReward] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAndUpdateStreak();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAndUpdateStreak = async () => {
    if (!user) return;

    try {
      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_user_id', user.id)
        .maybeSingle();

      if (!userData) {
        setLoading(false);
        return;
      }

      // Get today's date (UTC)
      const today = new Date().toISOString().split('T')[0];
      
      // Check events for login streak tracking
      const { data: events } = await supabase
        .from('events')
        .select('timestamp, payload')
        .eq('event_type', 'daily_login')
        .order('timestamp', { ascending: false })
        .limit(100);

      // Filter events for this user (checking payload)
      const userEvents = events?.filter(e => {
        const payload = e.payload as any;
        return payload?.user_id === userData.id;
      }) || [];

      // Get unique login dates
      const loginDates = [...new Set(
        userEvents.map(e => new Date(e.timestamp).toISOString().split('T')[0])
      )].sort().reverse();

      const todayCheckedIn = loginDates.includes(today);
      
      // Calculate streak
      let currentStreak = 0;
      const checkDate = new Date();
      
      // If already checked in today, start from today
      // Otherwise, check if we need to check in
      if (todayCheckedIn) {
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Count consecutive days
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (loginDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // If not checked in today and yesterday wasn't either, reset streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (!todayCheckedIn && !loginDates.includes(yesterdayStr)) {
        currentStreak = 0;
      }

      // Check in for today if not already done
      if (!todayCheckedIn) {
        // Get a session for this user
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', userData.id)
          .limit(1);

        if (sessions && sessions.length > 0) {
          await supabase.from('events').insert({
            event_type: 'daily_login',
            session_id: sessions[0].id,
            payload: { user_id: userData.id, date: today }
          });
          
          currentStreak = Math.max(currentStreak, 1);
          setShowReward(true);
          setTimeout(() => setShowReward(false), 3000);
        }
      }

      // Calculate multiplier
      const multiplierTier = [...MULTIPLIER_TIERS]
        .reverse()
        .find(tier => currentStreak >= tier.minStreak) || MULTIPLIER_TIERS[0];

      setStreakData({
        currentStreak,
        longestStreak: Math.max(currentStreak, loginDates.length),
        lastLoginDate: today,
        multiplier: multiplierTier.multiplier,
        todayCheckedIn: true
      });

    } catch (error) {
      console.error('Error checking streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTier = () => {
    return [...MULTIPLIER_TIERS]
      .reverse()
      .find(tier => streakData.currentStreak >= tier.minStreak) || MULTIPLIER_TIERS[0];
  };

  const getNextTier = () => {
    const currentIndex = MULTIPLIER_TIERS.findIndex(
      tier => tier.minStreak > streakData.currentStreak
    );
    return currentIndex !== -1 ? MULTIPLIER_TIERS[currentIndex] : null;
  };

  const nextTier = getNextTier();
  const currentTier = getCurrentTier();

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border animate-pulse">
        <CardContent className="p-4 h-24" />
      </Card>
    );
  }

  return (
    <>
      {/* Reward Popup */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className="bg-gradient-to-br from-orange-500/90 to-red-600/90 backdrop-blur-lg border-2 border-yellow-400 shadow-2xl shadow-orange-500/50">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <FlameIcon streak={streakData.currentStreak} size="lg" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mt-4"
                >
                  Daily Streak!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-yellow-200 text-lg"
                >
                  {streakData.currentStreak} Day{streakData.currentStreak !== 1 ? 's' : ''} 🔥
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  <Badge className="mt-3 bg-yellow-400 text-black font-bold text-lg px-4 py-1">
                    {currentTier.label}
                  </Badge>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${
          streakData.currentStreak >= 7 
            ? 'bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 border-orange-500/50 shadow-lg shadow-orange-500/20' 
            : streakData.currentStreak >= 3
            ? 'bg-gradient-to-r from-orange-400/10 to-yellow-400/10 border-orange-400/30'
            : 'bg-card/50 backdrop-blur border-border'
        }`}>
          {/* Animated background for high streaks */}
          {streakData.currentStreak >= 7 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          )}

          <CardContent className="relative p-4">
            <div className="flex items-center gap-4">
              {/* Flame Icon */}
              <FlameIcon streak={streakData.currentStreak} size="md" />

              {/* Streak Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {streakData.currentStreak}
                  </span>
                  <span className="text-muted-foreground">
                    Day{streakData.currentStreak !== 1 ? 's' : ''} Streak
                  </span>
                </div>
                
                {/* Progress to next tier */}
                {nextTier && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{nextTier.label} in {nextTier.minStreak - streakData.currentStreak} days</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${((streakData.currentStreak - (MULTIPLIER_TIERS[MULTIPLIER_TIERS.indexOf(nextTier) - 1]?.minStreak || 0)) / 
                            (nextTier.minStreak - (MULTIPLIER_TIERS[MULTIPLIER_TIERS.indexOf(nextTier) - 1]?.minStreak || 0))) * 100}%` 
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Multiplier Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-right"
              >
                <Badge 
                  className={`text-lg font-bold px-3 py-1 ${
                    streakData.multiplier >= 2 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : streakData.multiplier >= 1.5
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  {streakData.multiplier}x
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Bonus Multiplier</p>
              </motion.div>
            </div>

            {/* Streak milestones */}
            <div className="flex justify-between mt-4 pt-3 border-t border-border/50">
              {[3, 7, 14, 30].map((milestone) => (
                <div 
                  key={milestone}
                  className={`flex flex-col items-center ${
                    streakData.currentStreak >= milestone ? 'text-orange-500' : 'text-muted-foreground/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    streakData.currentStreak >= milestone 
                      ? 'bg-gradient-to-br from-orange-400 to-red-500' 
                      : 'bg-muted'
                  }`}>
                    {streakData.currentStreak >= milestone ? (
                      <Star className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold">{milestone}</span>
                    )}
                  </div>
                  <span className="text-xs mt-1">{milestone}d</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

export function StreakBadge() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      loadStreak();
    }
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_user_id', user.id)
        .maybeSingle();

      if (!userData) return;

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
      if (loginDates.includes(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (loginDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
    >
      <Flame className="w-4 h-4 text-orange-500" />
      <span className="text-sm font-bold text-orange-500">{streak}</span>
    </motion.div>
  );
}

export { FlameIcon, MULTIPLIER_TIERS };
