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
  const [gameIdMapping, setGameIdMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for both authenticated users and guest users
    const guestUserId = localStorage.getItem('guestUserId');
    
    if (!user && !userId && !guestUserId) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    console.log('User authenticated, initializing session');
    loadGamesFromDatabase();
    initializeSession();
  }, [user, userId]);

  const loadGamesFromDatabase = async () => {
    console.log('Loading games from database...');
    const { data: dbGames, error } = await supabase
      .from('games')
      .select('id, slug, name');

    if (error) {
      console.error('Error loading games from database:', error);
      toast({
        title: 'Error',
        description: 'Failed to load games. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }

    if (dbGames && dbGames.length > 0) {
      console.log('Loaded games from database:', dbGames);
      
      // Mapping of database slugs to frontend slugs
      const slugMapping: Record<string, string> = {
        'dictator_v1': 'dictator',
        'ultimatum_v1': 'ultimatum',
        'delay_discounting_v1': 'delay-discounting',
        'prisoners_dilemma_v1': 'prisoners-dilemma',
        'trust_game_v1': 'trust-game',
        'lottery_v1': 'risk-lottery',
        'race_to_zero_v1': 'race-to-zero',
        'framing_v1': 'framing-game',
        'social_comparison_v1': 'social-comparison',
        'quantum_v1': 'quantum-dilemma',
      };
      
      const mapping: Record<string, string> = {};
      dbGames.forEach((game) => {
        const frontendSlug = slugMapping[game.slug];
        if (frontendSlug) {
          mapping[frontendSlug] = game.id;
          console.log(`✓ Mapped: ${game.slug} → ${frontendSlug} → ${game.id}`);
        } else {
          console.warn(`⚠ No mapping found for database slug: ${game.slug}`);
        }
      });
      
      setGameIdMapping(mapping);
      console.log('Game ID mapping complete. Total games mapped:', Object.keys(mapping).length);
      
      if (Object.keys(mapping).length === 0) {
        toast({
          title: 'Warning',
          description: 'No games could be mapped. Please contact support.',
          variant: 'destructive'
        });
      }
    } else {
      console.error('No games found in database!');
      toast({
        title: 'Warning',
        description: 'No games found in database. Please contact support.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    
    loadUserProgress();
    
    // Real-time subscription for results - any changes trigger reload
    const resultsChannel = supabase
      .channel('results-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'results'
        },
        (payload) => {
          console.log('Real-time result update:', payload);
          // Reload progress when any result is added/updated
          loadUserProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(resultsChannel);
    };
  }, [sessionId]);

  const initializeSession = async () => {
    const currentUserId = userId || localStorage.getItem('guestUserId');
    
    if (!currentUserId) {
      console.log('No user ID found in initializeSession');
      navigate('/auth');
      return;
    }

    console.log('Initializing session for user:', currentUserId);
    
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
    if (!currentUserId) {
      console.log('No user ID found');
      return;
    }

    console.log('Loading progress for user:', currentUserId);

    // Load all results for this user
    const { data: userSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', currentUserId);

    if (sessionsError) {
      console.error('Error loading sessions:', sessionsError);
      return;
    }

    if (!userSessions || userSessions.length === 0) {
      console.log('No sessions found for user');
      return;
    }

    const sessionIds = userSessions.map(s => s.id);
    console.log('Found sessions:', sessionIds);

    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .in('session_id', sessionIds);

    if (resultsError) {
      console.error('Error loading results:', resultsError);
      return;
    }

    console.log('Loaded results:', results?.length || 0);

    if (results && results.length > 0) {
      // Calculate stats
      const totalPoints = results.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
      const uniqueGames = new Set(results.map(r => r.game_id)).size;
      
      console.log('Stats:', { totalPoints, uniqueGames });
      
      // Update games with completion status
      const updatedGames = GAMES_DATA.map(game => {
        // Match by slug using the gameIdMapping
        const gameUuid = gameIdMapping[game.slug];
        const gameResults = results.filter(r => r.game_id === gameUuid);
        const levelProgress = { ...game.levelProgress };
        
        const beginnerComplete = gameResults.some(r => r.level === 'beginner');
        const intermediateComplete = gameResults.some(r => r.level === 'intermediate');
        const advancedComplete = gameResults.some(r => r.level === 'advanced');

        console.log(`Game ${game.name}: B:${beginnerComplete} I:${intermediateComplete} A:${advancedComplete}`);

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

      // Unlock next game logic - if you complete beginner level, unlock the next game
      for (let i = 0; i < updatedGames.length - 1; i++) {
        const currentGame = updatedGames[i];
        const nextGame = updatedGames[i + 1];
        
        // If current game has at least beginner completed, unlock next game
        if (currentGame.levelProgress.beginner === 'completed' && nextGame.status === 'locked') {
          nextGame.status = 'available';
          nextGame.levelProgress.beginner = 'available';
          console.log(`Unlocked next game: ${nextGame.name}`);
        }
      }

      setGames(updatedGames);
      setStats({
        totalPoints: Math.round(totalPoints),
        gamesCompleted: uniqueGames,
        currentLevel: Math.floor(uniqueGames / 3) + 1
      });

      console.log('Progress updated successfully');
    } else {
      console.log('No results found, keeping default game states');
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
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'No active session found',
        variant: 'destructive'
      });
      return;
    }

    const game = games.find(g => g.id === currentGame?.id);
    if (!game) {
      toast({
        title: 'Error',
        description: 'Game not found',
        variant: 'destructive'
      });
      return;
    }

    // Get the actual UUID from the database mapping
    const gameUuid = gameIdMapping[game.slug];
    if (!gameUuid) {
      console.error('Game UUID not found for slug:', game.slug);
      toast({
        title: 'Error',
        description: 'Game not found in database. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }

    console.log('Saving game result:', {
      session_id: sessionId,
      game_slug: game.slug,
      game_uuid: gameUuid,
      level: currentGame?.level,
      score: result.score
    });

    const { data, error } = await supabase
      .from('results')
      .insert({
        session_id: sessionId,
        game_id: gameUuid, // Use the UUID from database
        level: currentGame?.level || 'beginner',
        inputs: result.inputs || {},
        outcome: result.outcome || {},
        score: result.score || 0,
        time_taken_sec: result.timeTaken || 0
      })
      .select();

    if (error) {
      console.error('Failed to save result:', error);
      toast({
        title: 'Error',
        description: `Failed to save game result: ${error.message}`,
        variant: 'destructive'
      });
      return;
    }

    console.log('Result saved successfully:', data);

    // Show success message
    toast({
      title: '🎉 Game Complete!',
      description: `You earned ${result.score || 0} points! Level unlocked.`,
    });
    
    // Force immediate reload of progress
    await loadUserProgress();
    
    // Small delay before going back to lobby to show the toast
    setTimeout(() => {
      setCurrentGame(null);
    }, 1500);
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
