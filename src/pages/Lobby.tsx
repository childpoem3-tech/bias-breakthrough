import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/GameCard';
import { GameSession } from '@/components/GameSession';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { GAMES_DATA } from '@/data/games';
import { Game, GameLevel } from '@/types/game';
import { LogOut, User, Trophy, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Lobby() {
  const navigate = useNavigate();
  const { user, userId, signOut } = useAuth();
  const { toast } = useToast();
  const [currentGame, setCurrentGame] = useState<{ id: string; level: GameLevel } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>(GAMES_DATA);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalPoints: 0, gamesCompleted: 0, currentLevel: 1 });

  useEffect(() => {
    if (!user && !userId) {
      navigate('/auth');
      return;
    }
    
    initializeSession();
    loadUserProgress();
    
    // Real-time subscription for results
    const channel = supabase
      .channel('lobby-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'results',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          loadUserProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userId, sessionId]);

  const initializeSession = async () => {
    if (!userId) {
      const guestId = localStorage.getItem('guestUserId');
      if (!guestId) {
        navigate('/auth');
        return;
      }
    }

    const currentUserId = userId || localStorage.getItem('guestUserId');
    
    const { data: activeSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', currentUserId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (activeSession) {
      setSessionId(activeSession.id);
      await supabase
        .from('sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', activeSession.id);
    } else {
      const { data: newSession } = await supabase
        .from('sessions')
        .insert({
          user_id: currentUserId,
          device_info: {
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
          }
        })
        .select()
        .single();

      if (newSession) {
        setSessionId(newSession.id);
      }
    }
  };

  const loadUserProgress = async () => {
    const currentUserId = userId || localStorage.getItem('guestUserId');
    if (!currentUserId) return;

    // Load profile (placeholder for when profiles table is approved)
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('*')
    //   .eq('user_id', currentUserId)
    //   .single();

    // if (profile) {
    //   setUserProfile(profile);
    // }

    // Load all results for this user
    const { data: userSessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', currentUserId);

    if (!userSessions) return;

    const sessionIds = userSessions.map(s => s.id);

    const { data: results } = await supabase
      .from('results')
      .select('*')
      .in('session_id', sessionIds);

    if (results) {
      // Calculate stats
      const totalPoints = results.reduce((sum, r) => sum + (r.score || 0), 0);
      const uniqueGames = new Set(results.map(r => r.game_id)).size;
      
      // Update games with completion status
      const updatedGames = GAMES_DATA.map(game => {
        const gameResults = results.filter(r => r.game_id === game.id);
        const levelProgress = { ...game.levelProgress };
        
        const beginnerComplete = gameResults.some(r => r.level === 'beginner');
        const intermediateComplete = gameResults.some(r => r.level === 'intermediate');
        const advancedComplete = gameResults.some(r => r.level === 'advanced');

        if (beginnerComplete) {
          levelProgress.beginner = 'completed';
          levelProgress.intermediate = 'available';
        }
        if (intermediateComplete) {
          levelProgress.intermediate = 'completed';
          levelProgress.advanced = 'available';
        }
        if (advancedComplete) {
          levelProgress.advanced = 'completed';
        }

        const allComplete = beginnerComplete && intermediateComplete && advancedComplete;
        
        return {
          ...game,
          levelProgress,
          status: allComplete ? 'completed' : (beginnerComplete || intermediateComplete || advancedComplete ? 'available' : game.status)
        };
      });

      // Unlock next game logic
      const firstLockedIndex = updatedGames.findIndex(g => g.status === 'locked');
      if (firstLockedIndex > 0) {
        const previousGame = updatedGames[firstLockedIndex - 1];
        if (previousGame.levelProgress.beginner === 'completed') {
          updatedGames[firstLockedIndex].status = 'available';
          updatedGames[firstLockedIndex].levelProgress.beginner = 'available';
        }
      }

      setGames(updatedGames);
      setStats({
        totalPoints: Math.round(totalPoints),
        gamesCompleted: uniqueGames,
        currentLevel: Math.floor(uniqueGames / 3) + 1
      });
    }
  };

  const handleStartGame = (gameId: string, level: GameLevel) => {
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'Please wait while we initialize your session',
        variant: 'destructive'
      });
      return;
    }
    setCurrentGame({ id: gameId, level });
  };

  const handleGameComplete = async (result: any) => {
    if (!sessionId) return;

    const game = games.find(g => g.id === currentGame?.id);
    if (!game) return;

    const { error } = await supabase
      .from('results')
      .insert({
        session_id: sessionId,
        game_id: game.id,
        level: currentGame?.level || 'beginner',
        inputs: result.inputs || {},
        outcome: result.outcome || {},
        score: result.score || 0,
        time_taken_sec: result.timeTaken || 0
      });

    if (error) {
      console.error('Failed to save result:', error);
      toast({
        title: 'Error',
        description: 'Failed to save game result',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Game Complete!',
        description: `You earned ${result.score || 0} points`,
      });
      
      // Reload progress after saving
      await loadUserProgress();
      setCurrentGame(null);
    }
  };

  const handleBackToLobby = () => {
    setCurrentGame(null);
  };

  if (currentGame) {
    return (
      <GameSession
        gameId={currentGame.id}
        level={currentGame.level}
        onComplete={handleGameComplete}
        onBack={handleBackToLobby}
      />
    );
  }

  const progressPercentage = (stats.gamesCompleted / games.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <DecisionLabLogo size="sm" />
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-card-highlight border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalPoints}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card-highlight border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-success" />
                Games Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.gamesCompleted} / {games.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card-highlight border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Current Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">Level {stats.currentLevel}</div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Complete all games to unlock your full profile</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div className="space-y-6">
          {['beginner', 'intermediate', 'advanced'].map(tier => {
            const tierGames = games.filter(g => g.tier === tier);
            return (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className={
                      tier === 'beginner'
                        ? 'bg-success-muted text-success border-success'
                        : tier === 'intermediate'
                        ? 'bg-primary-muted text-primary border-primary'
                        : 'bg-accent-muted text-accent border-accent'
                    }
                  >
                    {tier.toUpperCase()} TIER
                  </Badge>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tierGames.map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onStartGame={handleStartGame}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
