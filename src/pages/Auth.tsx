import { Button } from '@/components/ui/button';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Auth() {
  const { signInWithGoogle, signInAsGuest, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/consent');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center">
        <div className="animate-pulse">
          <DecisionLabLogo size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-6">
            <DecisionLabLogo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Decision Lab</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to continue
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lab animate-scale-in">
          <div className="space-y-4">
            {/* Google Sign In */}
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2 hover:border-primary hover:bg-accent/50 transition-all duration-300 group"
              onClick={signInWithGoogle}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground font-medium">or</span>
              </div>
            </div>

            {/* Guest Continue */}
            <Button
              size="lg"
              variant="secondary"
              className="w-full h-14 text-base font-semibold group hover:bg-secondary/80 transition-all duration-300"
              onClick={signInAsGuest}
            >
              <UserCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Continue as Guest
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex gap-3">
              <Brain className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Anonymous & Secure</p>
                <p>Your data is encrypted and you can play without providing personal information.</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
