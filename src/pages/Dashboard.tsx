import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MATH_GAMES } from '@/data/mathGames';
import { LogOut, User, Sparkles } from 'lucide-react';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              7 World-Class 3D Math Games
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">
            Explore immersive 3D worlds and master mathematical concepts
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {MATH_GAMES.map((game, index) => (
            <Card
              key={game.id}
              className="group relative overflow-hidden bg-background-secondary border-border hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(game.path)}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Animated Border Glow */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} blur-xl`} />
              </div>

              <CardContent className="relative p-6 space-y-4">
                {/* Icon */}
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {game.icon}
                </div>

                {/* Game Name */}
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {game.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {game.description}
                </p>

                {/* Theme Badge */}
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${game.gradient}`} />
                  <span className="text-xs text-muted-foreground">{game.theme}</span>
                </div>

                {/* Features */}
                <div className="space-y-1 pt-2 border-t border-border/50">
                  {game.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className={`h-1 w-1 rounded-full bg-gradient-to-r ${game.gradient}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Play Button */}
                <Button 
                  className={`w-full mt-4 bg-gradient-to-r ${game.gradient} hover:opacity-90 transition-opacity`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(game.path);
                  }}
                >
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Each game features world-class 3D animations, interactive controls, and immersive learning experiences
          </p>
        </div>
      </main>
    </div>
  );
}
