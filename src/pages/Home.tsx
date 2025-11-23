import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MATH_GAMES } from '@/data/mathGames';
import { ConsentModal } from '@/components/ConsentModal';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [showConsent, setShowConsent] = useState(false);

  const handlePlayClick = () => {
    if (userId) {
      navigate('/dashboard');
    } else {
      setShowConsent(true);
    }
  };

  const handleConsentAccept = () => {
    setShowConsent(false);
    navigate('/consent');
  };

  const handleConsentDecline = () => {
    setShowConsent(false);
  };

  return (
    <>
      <ConsentModal 
        isOpen={showConsent}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <DecisionLabLogo />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={handlePlayClick}>
                  Play for Free
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              DecisionLab
            </h1>
            <Sparkles className="w-10 h-10 text-accent animate-pulse" />
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            7 World-Class 3D Math Games
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Immersive 3D worlds where you explore coordinates, factors, sequences, permutations, combinations, probability, and speed calculations
          </p>
          
          <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button 
              size="lg" 
              onClick={handlePlayClick}
              className="gap-2 text-lg px-8 py-6"
            >
              Start Playing <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="gap-2 text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </section>

        {/* 3D Games Icons Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">Explore 7 3D Math Worlds</h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Click any game to start your immersive learning journey
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-6xl mx-auto">
            {MATH_GAMES.map((game, index) => (
              <Card
                key={game.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl animate-fade-in bg-background-secondary border-border hover:border-primary"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  if (userId) {
                    navigate(game.path);
                  } else {
                    handlePlayClick();
                  }
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <CardContent className="relative p-6 flex flex-col items-center text-center">
                  <div className="text-5xl mb-3 transform group-hover:scale-125 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-bold text-lg mb-2">3D Immersion</h3>
                <p className="text-sm text-muted-foreground">
                  Explore fully interactive 3D environments with stunning visuals
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="font-bold text-lg mb-2">Real-Time Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Master concepts through hands-on gameplay with instant feedback
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
              <CardContent className="p-6 text-center">
                <ArrowRight className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <h3 className="font-bold text-lg mb-2">Progressive Challenges</h3>
                <p className="text-sm text-muted-foreground">
                  Start simple and advance through increasingly complex puzzles
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-16">
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Explore 3D Math Worlds?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join learners worldwide in discovering mathematical concepts through immersive 3D experiences
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={handlePlayClick} className="gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <DecisionLabLogo size="sm" />
              <p className="text-sm text-muted-foreground">
                © 2025 DecisionLab. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
