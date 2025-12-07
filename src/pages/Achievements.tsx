import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { 
  Trophy, Star, Flame, Target, Zap, Crown, Medal,
  ArrowLeft, Lock, Sparkles, Award, Gamepad2, Clock,
  TrendingUp, Heart, Shield, Rocket, Diamond, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

interface AchievementProgress {
  achievement_id: string;
  current: number;
  target: number;
  percentage: number;
}

// Achievement definitions (will be in DB)
const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Game Milestones
  { id: '1', name: 'First Steps', description: 'Complete your first game', icon: 'gamepad', category: 'milestones', points: 10, requirement_type: 'games_played', requirement_value: 1, rarity: 'common' },
  { id: '2', name: 'Getting Started', description: 'Complete 5 games', icon: 'target', category: 'milestones', points: 25, requirement_type: 'games_played', requirement_value: 5, rarity: 'common' },
  { id: '3', name: 'Dedicated Learner', description: 'Complete 25 games', icon: 'flame', category: 'milestones', points: 50, requirement_type: 'games_played', requirement_value: 25, rarity: 'rare' },
  { id: '4', name: 'Math Champion', description: 'Complete 100 games', icon: 'crown', category: 'milestones', points: 100, requirement_type: 'games_played', requirement_value: 100, rarity: 'epic' },
  { id: '5', name: 'Math Legend', description: 'Complete 500 games', icon: 'diamond', category: 'milestones', points: 250, requirement_type: 'games_played', requirement_value: 500, rarity: 'legendary' },
  
  // Score Achievements
  { id: '6', name: 'Point Collector', description: 'Earn 100 total points', icon: 'star', category: 'scores', points: 15, requirement_type: 'total_score', requirement_value: 100, rarity: 'common' },
  { id: '7', name: 'Score Hunter', description: 'Earn 500 total points', icon: 'zap', category: 'scores', points: 35, requirement_type: 'total_score', requirement_value: 500, rarity: 'rare' },
  { id: '8', name: 'Point Master', description: 'Earn 2000 total points', icon: 'trophy', category: 'scores', points: 75, requirement_type: 'total_score', requirement_value: 2000, rarity: 'epic' },
  { id: '9', name: 'Score Legend', description: 'Earn 10000 total points', icon: 'medal', category: 'scores', points: 150, requirement_type: 'total_score', requirement_value: 10000, rarity: 'legendary' },
  
  // Streak Achievements
  { id: '10', name: 'On Fire', description: 'Get a 3-game streak', icon: 'flame', category: 'streaks', points: 20, requirement_type: 'streak', requirement_value: 3, rarity: 'common' },
  { id: '11', name: 'Unstoppable', description: 'Get a 7-game streak', icon: 'rocket', category: 'streaks', points: 50, requirement_type: 'streak', requirement_value: 7, rarity: 'rare' },
  { id: '12', name: 'Legendary Streak', description: 'Get a 15-game streak', icon: 'shield', category: 'streaks', points: 100, requirement_type: 'streak', requirement_value: 15, rarity: 'epic' },
  
  // Exploration Achievements
  { id: '13', name: 'Explorer', description: 'Try 3 different games', icon: 'sparkles', category: 'exploration', points: 30, requirement_type: 'unique_games', requirement_value: 3, rarity: 'common' },
  { id: '14', name: 'Adventurer', description: 'Try all 7 games', icon: 'award', category: 'exploration', points: 75, requirement_type: 'unique_games', requirement_value: 7, rarity: 'rare' },
  
  // Performance Achievements
  { id: '15', name: 'Perfect Score', description: 'Score 100 points in a single game', icon: 'star', category: 'performance', points: 40, requirement_type: 'single_score', requirement_value: 100, rarity: 'rare' },
  { id: '16', name: 'Speed Demon', description: 'Complete a game in under 30 seconds', icon: 'clock', category: 'performance', points: 50, requirement_type: 'speed', requirement_value: 30, rarity: 'epic' },
];

const ICON_MAP: Record<string, React.ElementType> = {
  gamepad: Gamepad2,
  target: Target,
  flame: Flame,
  crown: Crown,
  diamond: Diamond,
  star: Star,
  zap: Zap,
  trophy: Trophy,
  medal: Medal,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  award: Award,
  clock: Clock,
  gift: Gift,
  heart: Heart,
  trending: TrendingUp,
};

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const RARITY_GLOW = {
  common: 'shadow-gray-500/30',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/30',
  legendary: 'shadow-yellow-500/30',
};

const CATEGORY_LABELS: Record<string, string> = {
  milestones: '🎯 Milestones',
  scores: '⭐ Scores',
  streaks: '🔥 Streaks',
  exploration: '🌟 Exploration',
  performance: '⚡ Performance',
};

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [achievements] = useState<Achievement[]>(ACHIEVEMENT_DEFINITIONS);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, AchievementProgress>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    totalUnlocked: 0,
    totalPoints: 0,
    totalAchievements: ACHIEVEMENT_DEFINITIONS.length
  });
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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

      // Get user's sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userData.id);

      const sessionIds = sessions?.map(s => s.id) || [];

      // Get user's results
      const { data: results } = await supabase
        .from('results')
        .select('score, game_id, time_taken_sec')
        .in('session_id', sessionIds.length > 0 ? sessionIds : ['none']);

      // Calculate progress for each achievement
      const totalGames = results?.length || 0;
      const totalScore = results?.reduce((sum, r) => sum + (Number(r.score) || 0), 0) || 0;
      const uniqueGames = new Set(results?.map(r => r.game_id) || []).size;
      const maxSingleScore = Math.max(...(results?.map(r => Number(r.score) || 0) || [0]));
      const minTime = Math.min(...(results?.filter(r => r.time_taken_sec).map(r => Number(r.time_taken_sec)) || [999]));

      const progressMap: Record<string, AchievementProgress> = {};
      const unlocked = new Set<string>();

      ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
        let current = 0;
        const target = achievement.requirement_value;

        switch (achievement.requirement_type) {
          case 'games_played':
            current = totalGames;
            break;
          case 'total_score':
            current = totalScore;
            break;
          case 'unique_games':
            current = uniqueGames;
            break;
          case 'single_score':
            current = maxSingleScore;
            break;
          case 'speed':
            current = minTime < 999 ? (target - minTime + target) : 0; // Inverted for speed
            break;
          case 'streak':
            current = Math.min(totalGames, 3); // Simplified streak calc
            break;
        }

        const percentage = Math.min((current / target) * 100, 100);
        progressMap[achievement.id] = { achievement_id: achievement.id, current, target, percentage };

        if (current >= target) {
          unlocked.add(achievement.id);
        }
      });

      setUnlockedIds(unlocked);
      setProgress(progressMap);
      
      const totalPoints = ACHIEVEMENT_DEFINITIONS
        .filter(a => unlocked.has(a.id))
        .reduce((sum, a) => sum + a.points, 0);

      setStats({
        totalUnlocked: unlocked.size,
        totalPoints,
        totalAchievements: ACHIEVEMENT_DEFINITIONS.length
      });

    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Star;
    return IconComponent;
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const categories = ['all', ...new Set(achievements.map(a => a.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* New Achievement Unlock Modal */}
      <AnimatePresence>
        {newUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setNewUnlock(null)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-center"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 60px rgba(251, 191, 36, 0.5)', '0 0 120px rgba(251, 191, 36, 0.8)', '0 0 60px rgba(251, 191, 36, 0.5)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${RARITY_COLORS[newUnlock.rarity]} flex items-center justify-center`}
              >
                {(() => {
                  const IconComp = getIcon(newUnlock.icon);
                  return <IconComp className="w-16 h-16 text-white" />;
                })()}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-yellow-500 mb-2"
              >
                Achievement Unlocked!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white mb-2"
              >
                {newUnlock.name}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-muted-foreground"
              >
                +{newUnlock.points} points
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <DecisionLabLogo size="sm" />
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                {stats.totalUnlocked} / {stats.totalAchievements}
              </Badge>
              <Badge className="gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500">
                <Star className="w-4 h-4" />
                {stats.totalPoints} pts
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Achievements
            </h1>
            <Award className="w-10 h-10 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">Unlock badges and earn rewards as you learn</p>
        </motion.div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="p-6 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
              <p className="text-3xl font-bold">{stats.totalUnlocked}</p>
              <p className="text-sm text-muted-foreground">Unlocked</p>
              <Progress 
                value={(stats.totalUnlocked / stats.totalAchievements) * 100} 
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="p-6 text-center">
              <Star className="w-10 h-10 mx-auto mb-3 text-amber-500" />
              <p className="text-3xl font-bold">{stats.totalPoints}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-purple-500" />
              <p className="text-3xl font-bold">{stats.totalAchievements - stats.totalUnlocked}</p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? '🏆 All' : CATEGORY_LABELS[category] || category}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading achievements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredAchievements.map((achievement, index) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const prog = progress[achievement.id];
                const IconComp = getIcon(achievement.icon);

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`relative overflow-hidden transition-all duration-300 ${
                        isUnlocked 
                          ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}/10 border-2 shadow-lg ${RARITY_GLOW[achievement.rarity]}` 
                          : 'bg-card/30 border-border opacity-70'
                      } ${isUnlocked ? 'border-opacity-50' : ''}`}
                      style={{ 
                        borderColor: isUnlocked ? undefined : undefined 
                      }}
                    >
                      {/* Rarity Banner */}
                      <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase rounded-bl-lg bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white`}>
                        {achievement.rarity}
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              isUnlocked 
                                ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}` 
                                : 'bg-muted'
                            }`}
                          >
                            {isUnlocked ? (
                              <IconComp className="w-8 h-8 text-white" />
                            ) : (
                              <Lock className="w-8 h-8 text-muted-foreground" />
                            )}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className={`font-bold text-lg ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            
                            {/* Progress Bar */}
                            {!isUnlocked && prog && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{Math.min(prog.current, prog.target)} / {prog.target}</span>
                                  <span>{Math.round(prog.percentage)}%</span>
                                </div>
                                <Progress value={prog.percentage} className="h-2" />
                              </div>
                            )}

                            {/* Points */}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={isUnlocked ? 'default' : 'secondary'} className="gap-1">
                                <Star className="w-3 h-3" />
                                {achievement.points} pts
                              </Badge>
                              {isUnlocked && (
                                <Badge variant="outline" className="gap-1 text-green-500 border-green-500">
                                  ✓ Unlocked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Call to Action */}
        {!loading && stats.totalUnlocked < stats.totalAchievements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Gamepad2 className="w-5 h-5" />
              Play Games to Unlock More
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
