import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';

/**
 * This page handles the OAuth callback from Google/Supabase.
 * After Google login, Supabase redirects here with a `code` param.
 * We exchange that code for a real session, then redirect to /dashboard.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically reads the code from the URL and sets the session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=callback_failed');
        return;
      }

      if (data.session) {
        // Successfully authenticated — go to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // No session yet — Supabase might still be exchanging the code
        // Listen for the auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              navigate('/dashboard', { replace: true });
            } else if (event === 'SIGNED_OUT') {
              subscription.unsubscribe();
              navigate('/auth');
            }
          }
        );

        // Timeout fallback after 5 seconds
        setTimeout(() => {
          subscription.unsubscribe();
          navigate('/auth?error=timeout');
        }, 5000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex flex-col items-center justify-center gap-6">
      <div className="animate-pulse">
        <DecisionLabLogo size="lg" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
