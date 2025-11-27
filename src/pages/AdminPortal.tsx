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
  TrendingUp, Clock, GamepadIcon, Eye, Filter, Radio, User, Award
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { MATH_GAMES } from '@/data/mathGames';

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

interface LiveActivity {
  user_id: string;
  display_name: string | null;
  email: string;
  game_slug: string;
  game_name: string;
  started_at: string;
  level?: string;
  score?: number;
}

interface StudentDetails extends StudentActivity {
  game_history: {
    game_name: string;
    plays: number;
    avg_score: number;
    last_played: string;
  }[];
}

export default function AdminPortal() {
  const { user, userId, signOut } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      loadLiveActivity();
      setupRealtimeSubscriptions();
    } catch (error) {
      console.error('Authorization error:', error);
      navigate('/lobby');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        () => {
          loadLiveActivity();
          loadStudentActivity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'results'
        },
        () => {
          loadGameStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadLiveActivity = async () => {
    try {
      // Get active sessions from last 10 minutes
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          user_id,
          last_active_at,
          users!inner(id, email, supabase_user_id),
          results!inner(game_id, level, score, created_at)
        `)
        .gte('last_active_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .order('last_active_at', { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Get profiles for display names
      const userIds = [...new Set(sessions?.map((s: any) => s.users.id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      // Get games info
      const { data: games } = await supabase
        .from('games')
        .select('id, slug, name');

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      const gamesMap = new Map(games?.map(g => [g.id, { slug: g.slug, name: g.name }]) || []);

      const activities: LiveActivity[] = [];
      const seenUsers = new Set<string>();

      sessions?.forEach((session: any) => {
        if (session.results && session.results.length > 0) {
          const latestResult = session.results[0];
          const game = gamesMap.get(latestResult.game_id);
          const userId = session.users.id;

          // Only show the latest activity per user
          if (!seenUsers.has(userId) && game) {
            seenUsers.add(userId);
            activities.push({
              user_id: userId,
              display_name: profileMap.get(userId) || null,
              email: session.users.email || 'Guest',
              game_slug: game.slug,
              game_name: game.name,
              started_at: session.last_active_at,
              level: latestResult.level,
              score: latestResult.score
            });
          }
        }
      });

      setLiveActivities(activities);
    } catch (error) {
      console.error('Error loading live activity:', error);
    }
  };

  const loadStudentDetails = async (studentId: string) => {
    try {
      const student = students.find(s => s.user_id === studentId);
      if (!student) return;

      // First get all sessions for this user
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', studentId);

      const sessionIds = sessions?.map(s => s.id) || [];
      if (sessionIds.length === 0) {
        setSelectedStudent({
          ...student,
          game_history: []
        });
        return;
      }

      // Get game history
      const { data: results, error } = await supabase
        .from('results')
        .select(`
          game_id,
          score,
          created_at,
          games!inner(name)
        `)
        .in('session_id', sessionIds);

      if (error) throw error;

      // Group by game
      const gameHistory = new Map<string, { name: string; scores: number[]; dates: string[] }>();
      
      results?.forEach((result: any) => {
        const gameName = result.games.name;
        if (!gameHistory.has(gameName)) {
          gameHistory.set(gameName, { name: gameName, scores: [], dates: [] });
        }
        const game = gameHistory.get(gameName)!;
        game.scores.push(result.score || 0);
        game.dates.push(result.created_at);
      });

      const gameHistoryArray = Array.from(gameHistory.values()).map(game => ({
        game_name: game.name,
        plays: game.scores.length,
        avg_score: game.scores.reduce((a, b) => a + b, 0) / game.scores.length,
        last_played: game.dates.sort().reverse()[0]
      }));

      setSelectedStudent({
        ...student,
        game_history: gameHistoryArray
      });
    } catch (error) {
      console.error('Error loading student details:', error);
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

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredStudents = students.filter(student => 
    student.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="live">
              <Radio className="w-4 h-4 mr-2" />
              Live Activity
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="games">
              <GamepadIcon className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
          </TabsList>

          {/* Live Activity Tab */}
          <TabsContent value="live" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Radio className="w-5 h-5 text-green-500" />
                      </motion.div>
                      Live Game Activity
                    </CardTitle>
                    <CardDescription>Students currently playing (last 10 minutes)</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    {liveActivities.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {liveActivities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GamepadIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No students are currently playing</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {liveActivities.map((activity, index) => {
                        const game = MATH_GAMES.find(g => g.slug === activity.game_slug);
                        return (
                          <motion.div
                            key={activity.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game?.gradient || 'from-gray-500 to-gray-600'} flex items-center justify-center text-2xl`}>
                                {game?.icon || '🎮'}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {activity.display_name || activity.email || 'Anonymous Student'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Playing <span className="text-foreground font-medium">{activity.game_name}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              {activity.score !== undefined && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Score</p>
                                  <p className="font-bold text-primary">{activity.score}</p>
                                </div>
                              )}
                              {activity.level && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Level</p>
                                  <Badge variant="outline">{activity.level}</Badge>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-muted-foreground">Started</p>
                                <p className="text-sm font-medium">{getTimeAgo(activity.started_at)}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Student Activity</CardTitle>
                    <CardDescription>All registered students and their activity</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.user_id} className="cursor-pointer hover:bg-muted/50">
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
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadStudentDetails(student.user_id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found matching "{searchQuery}"
                  </div>
                )}
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

      {/* Student Details Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Details
            </DialogTitle>
            <DialogDescription>
              Complete profile and activity history
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedStudent.display_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStudent.email || 'Guest User'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-mono text-sm">{selectedStudent.user_id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{selectedStudent.total_sessions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Games Played</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{selectedStudent.total_games}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Last Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">
                      {selectedStudent.last_active ? getTimeAgo(selectedStudent.last_active) : 'Never'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Game History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Game Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedStudent.game_history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No games played yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Game</TableHead>
                          <TableHead>Times Played</TableHead>
                          <TableHead>Avg Score</TableHead>
                          <TableHead>Last Played</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStudent.game_history.map((game, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{game.game_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{game.plays}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-primary/10 text-primary">
                                {Math.round(game.avg_score)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(game.last_played)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
