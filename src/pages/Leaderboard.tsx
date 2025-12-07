import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { 
  Trophy, Medal, Crown, Star, Flame, TrendingUp, 
  Users, Gamepad2, Clock, ArrowLeft, Zap, Target,
  Award, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  total_score: number;
  total_games: number;
  games_played: number;
  last_played: string | null;
  rank: number;
  streak: number;
  avg_score: number;
}

interface GameLeaderboard {
  game_slug: string;
  game_name: string;
  entries: LeaderboardEntry[];
}

interface LiveScore {
  id: string;
  user_name: string;
  game_name: string;
  score: number;
  timestamp: string;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameLeaderboards, setGameLeaderboards] = useState<GameLeaderboard[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [userRank, setUserRank] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalGamesPlayed: 0,
    totalPointsEarned: 0,
    activePlayers: 0
  });

  useEffect(() => {
    loadLeaderboardData();
    loadStats();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'results' },
        async (payload) => {
          console.log('New score received:', payload);
          await handleNewScore(payload.new as any);
          loadLeaderboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNewScore = async (result: any) => {
    // Get game name
    const { data: game } = await supabase
      .from('games')
      .select('name')
      .eq('id', result.game_id)
      .single();

    // Get user name
    const { data: session } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', result.session_id)
      .single();

    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', session.user_id)
        .single();

      const newLiveScore: LiveScore = {
        id: result.id,
        user_name: profile?.display_name || 'Anonymous Player',
        game_name: game?.name || 'Unknown Game',
        score: result.score || 0,
        timestamp: result.created_at
      };

      setLiveScores(prev => [newLiveScore, ...prev].slice(0, 10));
    }
  };

  const loadStats = async () => {
    // Total players
    const { count: totalPlayers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Total games played
    const { count: totalGamesPlayed } = await supabase
      .from('results')
      .select('*', { count: 'exact', head: true });

    // Total points
    const { data: scoreData } = await supabase
      .from('results')
      .select('score');
    
    const totalPoints = scoreData?.reduce((sum, r) => sum + (r.score || 0), 0) || 0;

    // Active players (last 5 min)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activePlayers } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', fiveMinAgo);

    setStats({
      totalPlayers: totalPlayers || 0,
      totalGamesPlayed: totalGamesPlayed || 0,
      totalPointsEarned: totalPoints,
      activePlayers: activePlayers || 0
    });
  };

  const loadLeaderboardData = async () => {
    setLoading(true);
    try {
      // Load global leaderboard with aggregated data
      const { data: leaderboardData, error } = await supabase.rpc('get_student_activity');
      
      if (error) throw error;

      // Get scores for each user
      const enrichedData: LeaderboardEntry[] = await Promise.all(
        (leaderboardData || []).slice(0, 50).map(async (student: any, index: number) => {
          const { data: results } = await supabase
            .from('results')
            .select('score, session_id, created_at')
            .order('created_at', { ascending: false });

          const { data: sessions } = await supabase
            .from('sessions')
            .select('id')
            .eq('user_id', student.user_id);

          const sessionIds = sessions?.map(s => s.id) || [];
          const userResults = results?.filter(r => sessionIds.includes(r.session_id)) || [];
          const totalScore = userResults.reduce((sum, r) => sum + (r.score || 0), 0);
          const avgScore = userResults.length > 0 ? totalScore / userResults.length : 0;

          return {
            user_id: student.user_id,
            display_name: student.display_name,
            total_score: totalScore,
            total_games: Number(student.total_games) || 0,
            games_played: Number(student.total_games) || 0,
            last_played: student.last_active,
            rank: index + 1,
            streak: Math.floor(Math.random() * 10), // Would need streak tracking
            avg_score: Math.round(avgScore)
          };
        })
      );

      // Sort by total score
      enrichedData.sort((a, b) => b.total_score - a.total_score);
      enrichedData.forEach((entry, i) => entry.rank = i + 1);

      setGlobalLeaderboard(enrichedData);

      // Find user's rank
      if (user) {
        const userEntry = enrichedData.find(e => e.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }

      // Load per-game leaderboards
      const { data: games } = await supabase.from('games').select('*');
      
      if (games) {
        const gameBoards: GameLeaderboard[] = await Promise.all(
          games.map(async (game) => {
            const { data: gameResults } = await supabase
              .from('results')
              .select(`
                score,
                session_id,
                created_at,
                sessions!inner(user_id)
              `)
              .eq('game_id', game.id)
              .order('score', { ascending: false })
              .limit(10);

            const entries: LeaderboardEntry[] = await Promise.all(
              (gameResults || []).map(async (result: any, index: number) => {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('display_name')
                  .eq('user_id', result.sessions.user_id)
                  .single();

                return {
                  user_id: result.sessions.user_id,
                  display_name: profile?.display_name || null,
                  total_score: result.score || 0,
                  total_games: 1,
                  games_played: 1,
                  last_played: result.created_at,
                  rank: index + 1,
                  streak: 0,
                  avg_score: result.score || 0
                };
              })
            );

            return {
              game_slug: game.slug,
              game_name: game.name,
              entries
            };
          })
        );

        setGameLeaderboards(gameBoards);
      }

    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
      default: return 'bg-card border-border';
    }
  };

  const getTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
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
                <Zap className="w-4 h-4 text-green-500" />
                {stats.activePlayers} Active Now
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">Real-time rankings across all games</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Players', value: stats.totalPlayers, icon: Users, color: 'text-blue-500' },
            { label: 'Games Played', value: stats.totalGamesPlayed, icon: Gamepad2, color: 'text-green-500' },
            { label: 'Points Earned', value: stats.totalPointsEarned.toLocaleString(), icon: Star, color: 'text-yellow-500' },
            { label: 'Active Now', value: stats.activePlayers, icon: Flame, color: 'text-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Your Rank Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Global Rank</p>
                    <p className="text-3xl font-bold">#{userRank}</p>
                  </div>
                </div>
                <Button onClick={() => navigate('/dashboard')} className="gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Play to Climb
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="global" className="w-full">
              <TabsList className="w-full mb-4 bg-card/50 backdrop-blur">
                <TabsTrigger value="global" className="flex-1 gap-2">
                  <Trophy className="w-4 h-4" />
                  Global
                </TabsTrigger>
                <TabsTrigger value="games" className="flex-1 gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  By Game
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global">
                <Card className="bg-card/50 backdrop-blur border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Top Players
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence>
                      {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : globalLeaderboard.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No players yet</div>
                      ) : (
                        globalLeaderboard.slice(0, 15).map((entry, index) => (
                          <motion.div
                            key={entry.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-lg border ${getRankBg(entry.rank)}`}
                          >
                            <div className="flex items-center gap-4">
                              {getRankIcon(entry.rank)}
                              <div>
                                <p className="font-semibold">{entry.display_name || `Player ${entry.user_id.slice(0, 6)}`}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Gamepad2 className="w-3 h-3" />
                                    {entry.total_games} games
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {entry.avg_score} avg
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">{entry.total_score.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{getTimeAgo(entry.last_played)}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="games">
                <div className="space-y-6">
                  {gameLeaderboards.map((gameBoard) => (
                    <Card key={gameBoard.game_slug} className="bg-card/50 backdrop-blur border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-accent" />
                          {gameBoard.game_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {gameBoard.entries.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No scores yet</p>
                        ) : (
                          gameBoard.entries.slice(0, 5).map((entry, index) => (
                            <div
                              key={`${gameBoard.game_slug}-${entry.user_id}-${index}`}
                              className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                            >
                              <div className="flex items-center gap-3">
                                {getRankIcon(entry.rank)}
                                <span className="font-medium">{entry.display_name || `Player ${entry.user_id.slice(0, 6)}`}</span>
                              </div>
                              <span className="font-bold text-primary">{entry.total_score.toLocaleString()}</span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Activity Feed */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur border-border sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500 animate-pulse" />
                  Live Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {liveScores.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Waiting for scores...</p>
                      <p className="text-xs mt-1">Play a game to see live updates!</p>
                    </div>
                  ) : (
                    liveScores.map((score, index) => (
                      <motion.div
                        key={score.id}
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{score.user_name}</span>
                          <Badge variant="secondary" className="text-xs">
                            +{score.score}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{score.game_name}</span>
                          <span>{getTimeAgo(score.timestamp)}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
