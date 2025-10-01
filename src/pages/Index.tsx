import { useState, useEffect } from 'react';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { GameCard } from '@/components/GameCard';
import { GameSession } from '@/components/GameSession';
import { ConsentModal } from '@/components/ConsentModal';
import { GAMES_DATA, getTierGames } from '@/data/games';
import { GameTier, GameLevel, UserProgress } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, BarChart3, FileText, Play, Sparkles, Target, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [activeGame, setActiveGame] = useState<{ gameId: string; level: GameLevel } | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    currentTier: 'beginner',
    completedGames: [],
    totalScore: 0,
    biasProfile: {
      altruism: 0,
      fairness: 0,
      impulsivity: 0,
      riskTaking: 0,
      trust: 0,
      cooperation: 0,
      lossAversion: 0,
      statusBias: 0,
      overOptimism: 0,
      decisionUncertainty: 0,
    },
  });

  const handleConsent = () => {
    setHasConsented(true);
    setShowConsent(false);
    // Initialize session
    console.log('User consented - starting session');
  };

  const handleDeclineConsent = () => {
    setShowConsent(false);
    // Could redirect or show alternative content
  };

  const handleStartGame = (gameId: string, level: GameLevel) => {
    setActiveGame({ gameId, level });
  };

  const handleGameComplete = (result: any) => {
    console.log('Game completed:', result);
    // TODO: Save to Supabase and update user progress
    setActiveGame(null);
  };

  const handleBackToGames = () => {
    setActiveGame(null);
  };

  const calculateTierProgress = () => {
    const beginnerGames = getTierGames('beginner');
    const intermediateGames = getTierGames('intermediate');
    const advancedGames = getTierGames('advanced');

    return {
      beginner: (userProgress.completedGames.filter(id => 
        beginnerGames.some(g => g.id === id)).length / beginnerGames.length) * 100,
      intermediate: (userProgress.completedGames.filter(id => 
        intermediateGames.some(g => g.id === id)).length / intermediateGames.length) * 100,
      advanced: (userProgress.completedGames.filter(id => 
        advancedGames.some(g => g.id === id)).length / advancedGames.length) * 100,
    };
  };

  const totalProgress = (userProgress.completedGames.length / GAMES_DATA.length) * 100;

  if (!hasConsented) {
    return (
      <>
        <ConsentModal 
          isOpen={showConsent}
          onAccept={handleConsent}
          onDecline={handleDeclineConsent}
        />
        <div className="min-h-screen bg-gradient-lab flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <DecisionLabLogo size="lg" />
            <p className="text-muted-foreground mt-6">
              Loading research platform...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (activeGame) {
    return (
      <GameSession
        gameId={activeGame.gameId}
        level={activeGame.level}
        onComplete={handleGameComplete}
        onBack={handleBackToGames}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-lab">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <DecisionLabLogo />
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Total Score</p>
                <p className="text-2xl font-bold text-primary">{userProgress.totalScore}</p>
              </div>
              <Badge variant="outline" className="bg-gradient-primary text-primary-foreground border-primary">
                <Trophy className="w-4 h-4 mr-1" />
                Researcher
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Progress */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Research Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressIndicator 
                    currentTier={userProgress.currentTier}
                    tierProgress={calculateTierProgress()}
                    totalProgress={totalProgress}
                  />
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-accent mx-auto" />
                    <h3 className="font-semibold text-foreground">Bias Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete games to unlock your personalized decision-making profile
                    </p>
                    <Button variant="outline" disabled className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-foreground">
                  Discover Your <span className="text-foreground">Decision</span> Patterns
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Explore your decision-making patterns through scientifically-designed games. 
                  Unlock insights into cognitive biases and behavioral economics.
                </p>
                
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Research Study</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">10 Games</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">30-45 Minutes</span>
                  </div>
                </div>
              </div>

              {/* Game Tabs */}
              <Tabs defaultValue="beginner" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="beginner" className="data-[state=active]:bg-gradient-success">
                    <Target className="w-4 h-4 mr-2" />
                    Beginner
                  </TabsTrigger>
                  <TabsTrigger 
                    value="intermediate" 
                    disabled={userProgress.currentTier === 'beginner'}
                    className="data-[state=active]:bg-gradient-primary"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Intermediate
                  </TabsTrigger>
                  <TabsTrigger 
                    value="advanced"
                    disabled={userProgress.currentTier !== 'advanced'}
                    className="data-[state=active]:bg-gradient-primary"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="beginner" className="mt-6">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">Foundation Phase</h2>
                      <p className="text-muted-foreground">
                        Start with basic decision-making scenarios to establish your baseline patterns.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getTierGames('beginner').map((game) => (
                        <GameCard 
                          key={game.id}
                          game={game}
                          onStartGame={handleStartGame}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="intermediate" className="mt-6">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">Strategic Phase</h2>
                      <p className="text-muted-foreground">
                        Explore complex interactions involving trust, risk, and strategic thinking.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getTierGames('intermediate').map((game) => (
                        <GameCard 
                          key={game.id}
                          game={game}
                          onStartGame={handleStartGame}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="mt-6">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">Expert Phase</h2>
                      <p className="text-muted-foreground">
                        Master-level scenarios involving complex framing, social dynamics, and quantum uncertainty.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getTierGames('advanced').map((game) => (
                        <GameCard 
                          key={game.id}
                          game={game}
                          onStartGame={handleStartGame}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
