import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Shield, Users, Target, TrendingUp, Activity, Calendar, Globe } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'Web' | 'Pwn' | 'Crypto' | 'Forensics' | 'Reverse' | 'Misc';
  points: number;
  flag: string;
  hints: any[];
  files: string[];
  enabled: boolean;
  ctf_event_id: string;
  created_at: string;
}

interface CTFEvent {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  enabled: boolean;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  points: number;
  created_at: string;
}

interface Stats {
  totalChallenges: number;
  totalTeams: number;
  totalSubmissions: number;
  activeChallenges: number;
  totalCTFEvents: number;
}

const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [ctfEvents, setCTFEvents] = useState<CTFEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalChallenges: 0,
    totalTeams: 0,
    totalSubmissions: 0,
    activeChallenges: 0,
    totalCTFEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web' as Challenge['category'],
    points: 100,
    flag: '',
    hints: '',
    files: ''
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (challengesError) throw challengesError;
      setChallenges((challengesData || []).map(c => ({
        ...c,
        hints: Array.isArray(c.hints) ? c.hints : []
      })));

      // Fetch CTF events
      const { data: eventsData, error: eventsError } = await supabase
        .from('ctf_events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (eventsError) throw eventsError;
      setCTFEvents(eventsData || []);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('points', { ascending: false });
      
      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch submissions count
      const { count: submissionsCount, error: submissionsError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true });
      
      if (submissionsError) throw submissionsError;

      // Update stats
      setStats({
        totalChallenges: challengesData?.length || 0,
        totalTeams: teamsData?.length || 0,
        totalSubmissions: submissionsCount || 0,
        activeChallenges: challengesData?.filter(c => c.enabled).length || 0,
        totalCTFEvents: eventsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Web',
      points: 100,
      flag: '',
      hints: '',
      files: ''
    });
    setEditingChallenge(null);
    setShowAddForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.flag) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the first CTF event or create one if none exists
      let ctfEventId = ctfEvents[0]?.id;
      if (!ctfEventId) {
        const { data: newEvent, error: eventError } = await supabase
          .from('ctf_events')
          .insert({
            name: 'Default CTF Event',
            description: 'Default CTF event for challenges',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            enabled: true,
            is_public: true,
            ctf_code: 'DEFAULT_CTF',
            created_by: (await supabase.auth.getUser()).data.user?.id || ''
          })
          .select()
          .single();
        
        if (eventError) throw eventError;
        ctfEventId = newEvent.id;
      }

      const challengeData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        points: formData.points,
        flag: formData.flag,
        hints: formData.hints ? [{ text: formData.hints, pointDeduction: 10 }] : [],
        files: formData.files ? formData.files.split(',').map(f => f.trim()) : [],
        enabled: true,
        ctf_event_id: ctfEventId
      };

      if (editingChallenge) {
        const { error } = await supabase
          .from('challenges')
          .update(challengeData)
          .eq('id', editingChallenge.id);
        
        if (error) throw error;
        
        toast({
          title: "Challenge Updated",
          description: "Challenge has been successfully updated"
        });
      } else {
        const { error } = await supabase
          .from('challenges')
          .insert(challengeData);
        
        if (error) throw error;
        
        toast({
          title: "Challenge Added",
          description: "New challenge has been added to the CTF"
        });
      }

      resetForm();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast({
        title: "Error",
        description: "Failed to save challenge",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (challenge: Challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      points: challenge.points,
      flag: challenge.flag,
      hints: challenge.hints[0]?.text || '',
      files: challenge.files.join(', ')
    });
    setEditingChallenge(challenge);
    setShowAddForm(true);
  };

  const handleDelete = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);
      
      if (error) throw error;
      
      toast({
        title: "Challenge Deleted",
        description: "Challenge has been removed from the CTF"
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to delete challenge",
        variant: "destructive"
      });
    }
  };

  const toggleChallengeEnabled = async (challengeId: string) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const { error } = await supabase
        .from('challenges')
        .update({ enabled: !challenge.enabled })
        .eq('id', challengeId);
      
      if (error) throw error;
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error toggling challenge:', error);
      toast({
        title: "Error",
        description: "Failed to toggle challenge status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          CTF Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage CTF challenges and monitor activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.totalChallenges}</div>
                <div className="text-xs text-muted-foreground">Total Challenges</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.activeChallenges}</div>
                <div className="text-xs text-muted-foreground">Active Challenges</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-400">{stats.totalTeams}</div>
                <div className="text-xs text-muted-foreground">Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-orange-400">{stats.totalSubmissions}</div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold text-cyan-400">{stats.totalCTFEvents}</div>
                <div className="text-xs text-muted-foreground">CTF Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-pink-400" />
              <div>
                <div className="text-2xl font-bold text-pink-400">
                  {teams.reduce((sum, team) => sum + team.points, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Challenge Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {editingChallenge ? 'Edit Challenge' : 'Challenge Management'}
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? 'Cancel' : 'Add Challenge'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: Challenge['category']) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="Pwn">Pwn</SelectItem>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                    <SelectItem value="Forensics">Forensics</SelectItem>
                    <SelectItem value="Reverse">Reverse</SelectItem>
                    <SelectItem value="Misc">Misc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="flag">Flag *</Label>
                <Input
                  id="flag"
                  value={formData.flag}
                  onChange={(e) => setFormData({...formData, flag: e.target.value})}
                  placeholder="CTF{flag_here}"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hints">Hints (optional)</Label>
              <Input
                id="hints"
                value={formData.hints}
                onChange={(e) => setFormData({...formData, hints: e.target.value})}
                placeholder="Hint text"
              />
            </div>

            <div>
              <Label htmlFor="files">Files (comma-separated, optional)</Label>
              <Input
                id="files"
                value={formData.files}
                onChange={(e) => setFormData({...formData, files: e.target.value})}
                placeholder="file1.txt, file2.zip"
              />
            </div>

            <Button 
              onClick={handleSubmit}
              className="w-full"
            >
              {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <Badge variant={challenge.enabled ? "default" : "secondary"}>
                      {challenge.category}
                    </Badge>
                    <Badge variant="outline">
                      {challenge.points}pts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleChallengeEnabled(challenge.id)}
                    className={challenge.enabled ? 'text-green-600' : 'text-red-600'}
                  >
                    {challenge.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(challenge)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(challenge.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;