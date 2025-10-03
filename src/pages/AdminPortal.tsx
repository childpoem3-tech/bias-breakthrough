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
  Users, Activity, BarChart3, Download, LogOut, 
  TrendingUp, Clock, GamepadIcon, Eye, Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StudentActivity {
  user_id: string;
  email: string;
  display_name: string | null;
  total_sessions: number;
  total_games: number;
  last_active: string | null;
  created_at: string;
}

interface GameStats {
  game_slug: string;
  game_name: string;
  active_count: number;
  total_plays: number;
}

export default function AdminPortal() {
  const { user, userId, signOut } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthorization();
  }, [userId]);

  const checkAuthorization = async () => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    try {
      // Check if user has admin or researcher role
      const { data: roles, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', userId)
        .in('role', ['admin', 'researcher']);

      if (error) throw error;

      if (!roles || roles.length === 0) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the admin portal.',
          variant: 'destructive'
        });
        navigate('/lobby');
        return;
      }

      setIsAuthorized(true);
      loadStudentActivity();
      loadGameStats();
    } catch (error) {
      console.error('Authorization error:', error);
      navigate('/lobby');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentActivity = async () => {
    try {
      const { data, error } = await supabase.rpc('get_student_activity' as any) as { data: StudentActivity[] | null; error: any };
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading student activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student activity',
        variant: 'destructive'
      });
    }
  };

  const loadGameStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_active_players_by_game') as { data: GameStats[] | null; error: any };
      
      if (error) throw error;
      setGameStats(data || []);
    } catch (error) {
      console.error('Error loading game stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load game statistics',
        variant: 'destructive'
      });
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        generated_at: new Date().toISOString(),
        total_students: students.length,
        students: students,
        game_stats: gameStats
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      toast({
        title: 'Export Complete',
        description: 'Admin report downloaded successfully'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DecisionLabLogo size="lg" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DecisionLabLogo size="sm" />
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Researcher Portal
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/lobby')}>
              Student View
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {students.filter(s => {
                  if (!s.last_active) return false;
                  const diff = Date.now() - new Date(s.last_active).getTime();
                  return diff < 24 * 60 * 60 * 1000;
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {students.reduce((sum, s) => sum + s.total_sessions, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Games Played</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {gameStats.reduce((sum, g) => sum + g.total_plays, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="students">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="games">
              <GamepadIcon className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Activity</CardTitle>
                    <CardDescription>All registered students and their activity</CardDescription>
                  </div>
                  <Button onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Games</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.user_id}>
                        <TableCell className="font-medium">
                          {student.display_name || 'Anonymous'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.email || 'Guest User'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.total_sessions}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.total_games}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(student.last_active)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(student.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Statistics</CardTitle>
                <CardDescription>Popularity and engagement by game</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead>Active Now</TableHead>
                      <TableHead>Total Plays</TableHead>
                      <TableHead>Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameStats.map((game) => (
                      <TableRow key={game.game_slug}>
                        <TableCell className="font-medium">{game.game_name}</TableCell>
                        <TableCell>
                          <Badge variant={game.active_count > 0 ? "default" : "secondary"}>
                            {game.active_count}
                          </Badge>
                        </TableCell>
                        <TableCell>{game.total_plays}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ 
                                  width: `${Math.min((game.total_plays / Math.max(...gameStats.map(g => g.total_plays))) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((game.total_plays / gameStats.reduce((sum, g) => sum + g.total_plays, 1)) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
