import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { 
  User, Mail, Calendar, Trophy, BarChart3, Download, 
  Settings, LogOut, Edit, FileText 
} from 'lucide-react';

interface Profile {
  display_name: string | null;
  age_range: string | null;
  gender: string | null;
  education_level: string | null;
  occupation: string | null;
  country: string | null;
  research_consent: boolean;
  newsletter_opt_in: boolean;
  interests: string | null;
  created_at: string;
}

interface UserStats {
  total_games: number;
  total_sessions: number;
  average_score: number;
  completion_rate: number;
}

export default function Profile() {
  const { user, userId, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }
    loadProfile();
    loadStats();
  }, [userId, navigate]);

  const loadProfile = async () => {
    try {
      // Temporarily disabled until migration is approved
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single();

      // if (error && error.code !== 'PGRST116') throw error;
      // setProfile(data);
      
      setProfile(null); // Placeholder until migration is approved
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, completed')
        .eq('user_id', userId);

      // Get results
      const { data: results } = await supabase
        .from('results')
        .select('score, game_id')
        .in('session_id', sessions?.map(s => s.id) || []);

      if (results) {
        const totalGames = new Set(results.map(r => r.game_id)).size;
        const totalSessions = sessions?.length || 0;
        const avgScore = results.reduce((acc, r) => acc + (r.score || 0), 0) / (results.length || 1);
        const completionRate = sessions?.filter(s => s.completed).length || 0 / (totalSessions || 1) * 100;

        setStats({
          total_games: totalGames,
          total_sessions: totalSessions,
          average_score: Math.round(avgScore),
          completion_rate: Math.round(completionRate)
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDownloadReport = async () => {
    try {
      // Temporarily disabled until migration is approved
      // const { data, error } = await supabase.rpc('get_user_report', {
      //   p_user_id: userId
      // });

      // if (error) throw error;

      // Create sample report for now
      const sampleReport = {
        user_id: userId,
        generated_at: new Date().toISOString(),
        message: 'Full report will be available after database migration is approved'
      };

      const blob = new Blob([JSON.stringify(sampleReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decision-lab-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      toast({
        title: 'Report Downloaded',
        description: 'Sample report downloaded. Full features available after migration.'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DecisionLabLogo size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DecisionLabLogo size="sm" />
            <div>
              <h1 className="text-xl font-bold">My Profile</h1>
              <p className="text-sm text-muted-foreground">{user?.email || 'Guest User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/lobby')}>
              Back to Lobby
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Display Name</p>
                        <p className="font-medium">{profile.display_name || 'Not set'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Age Range</p>
                          <p className="font-medium">{profile.age_range || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-medium capitalize">{profile.gender?.replace('-', ' ') || 'Not set'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Education</p>
                        <p className="font-medium capitalize">{profile.education_level?.replace('-', ' ') || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Occupation</p>
                        <p className="font-medium">{profile.occupation || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Country</p>
                        <p className="font-medium">{profile.country || 'Not set'}</p>
                      </div>
                      {profile.interests && (
                        <div>
                          <p className="text-sm text-muted-foreground">Interests</p>
                          <p className="text-sm">{profile.interests}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No profile created yet</p>
                      <Button onClick={() => navigate('/profile-setup')}>
                        <Edit className="w-4 h-4 mr-2" />
                        Create Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                  <CardDescription>Your gameplay summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-accent/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{stats.total_games}</p>
                        <p className="text-sm text-muted-foreground">Games Played</p>
                      </div>
                      <div className="p-4 bg-accent/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{stats.total_sessions}</p>
                        <p className="text-sm text-muted-foreground">Sessions</p>
                      </div>
                      <div className="p-4 bg-accent/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{stats.average_score}</p>
                        <p className="text-sm text-muted-foreground">Avg Score</p>
                      </div>
                      <div className="p-4 bg-accent/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{stats.completion_rate}%</p>
                        <p className="text-sm text-muted-foreground">Completion</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No gameplay data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Reports & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={handleDownloadReport} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Complete Report
                </Button>
                <Button variant="outline" className="flex-1">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
                <CardDescription>Coming soon - comprehensive gameplay analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed charts and insights about your decision-making patterns will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Preferences</h3>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Research Participation</span>
                    <Badge variant={profile?.research_consent ? "default" : "secondary"}>
                      {profile?.research_consent ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Newsletter</span>
                    <Badge variant={profile?.newsletter_opt_in ? "default" : "secondary"}>
                      {profile?.newsletter_opt_in ? 'Subscribed' : 'Unsubscribed'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/profile-setup')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
