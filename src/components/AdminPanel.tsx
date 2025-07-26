import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCTFStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Challenge } from '@/types/ctf';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Shield, Users, Target } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { challenges, toggleChallengeEnabled, addChallenge, updateChallenge, deleteChallenge } = useCTFStore();
  const { toast } = useToast();
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

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.flag) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const challengeData: Omit<Challenge, 'id'> = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      points: formData.points,
      flag: formData.flag,
      hints: formData.hints ? [{ id: '1', text: formData.hints, pointDeduction: 10 }] : [],
      files: formData.files ? formData.files.split(',').map(f => f.trim()) : [],
      enabled: true,
      ctfId: '1',
      solves: editingChallenge?.solves || 0
    };

    if (editingChallenge) {
      updateChallenge(editingChallenge.id, challengeData);
      toast({
        title: "Challenge Updated",
        description: "Challenge has been successfully updated"
      });
    } else {
      addChallenge(challengeData);
      toast({
        title: "Challenge Added",
        description: "New challenge has been added to the CTF"
      });
    }

    resetForm();
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

  const handleDelete = (challengeId: string) => {
    deleteChallenge(challengeId);
    toast({
      title: "Challenge Deleted",
      description: "Challenge has been removed from the CTF"
    });
  };

  const totalSolves = challenges.reduce((sum, c) => sum + c.solves, 0);
  const averagePoints = challenges.length > 0 ? Math.round(challenges.reduce((sum, c) => sum + c.points, 0) / challenges.length) : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
          Admin Control Panel
        </h1>
        <p className="text-muted-foreground">Manage CTF challenges and monitor activity</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto text-neon-green mb-2" />
              <div className="text-2xl font-bold text-neon-green">{challenges.length}</div>
              <div className="text-sm text-muted-foreground">Total Challenges</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto text-neon-blue mb-2" />
              <div className="text-2xl font-bold text-neon-blue">{totalSolves}</div>
              <div className="text-sm text-muted-foreground">Total Solves</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto text-neon-purple mb-2" />
              <div className="text-2xl font-bold text-neon-purple">{averagePoints}</div>
              <div className="text-sm text-muted-foreground">Avg Points</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{challenges.filter(c => c.enabled).length}</div>
              <div className="text-sm text-muted-foreground">Active Challenges</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Challenge Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
        <CardHeader>
          <CardTitle className="text-neon-green flex items-center justify-between">
            {editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              size="sm"
              className="border-cyber-light hover:border-neon-green"
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
                  className="bg-cyber-light border-muted focus:border-neon-green"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: Challenge['category']) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-cyber-light border-muted focus:border-neon-green">
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
                className="bg-cyber-light border-muted focus:border-neon-green"
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
                  className="bg-cyber-light border-muted focus:border-neon-green"
                />
              </div>
              
              <div>
                <Label htmlFor="flag">Flag *</Label>
                <Input
                  id="flag"
                  value={formData.flag}
                  onChange={(e) => setFormData({...formData, flag: e.target.value})}
                  placeholder="CTF{flag_here}"
                  className="bg-cyber-light border-muted focus:border-neon-green"
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
                className="bg-cyber-light border-muted focus:border-neon-green"
              />
            </div>

            <div>
              <Label htmlFor="files">Files (comma-separated, optional)</Label>
              <Input
                id="files"
                value={formData.files}
                onChange={(e) => setFormData({...formData, files: e.target.value})}
                placeholder="file1.txt, file2.zip"
                className="bg-cyber-light border-muted focus:border-neon-green"
              />
            </div>

            <Button 
              onClick={handleSubmit}
              className="w-full bg-neon-green text-cyber-dark hover:bg-neon-green/90 shadow-neon"
            >
              {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Challenge Management */}
      <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
        <CardHeader>
          <CardTitle className="text-neon-green">Challenge Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-4 bg-cyber-light rounded-lg border border-muted"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                    <Badge className={`
                      ${challenge.category === 'Web' ? 'bg-neon-green text-cyber-dark' :
                        challenge.category === 'Pwn' ? 'bg-neon-blue text-cyber-dark' :
                        challenge.category === 'Crypto' ? 'bg-neon-purple text-cyber-dark' :
                        'bg-orange-500 text-cyber-dark'}
                    `}>
                      {challenge.category}
                    </Badge>
                    <Badge variant="outline" className="border-muted">
                      {challenge.points}pts
                    </Badge>
                    <Badge variant="outline" className="border-muted">
                      {challenge.solves} solves
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleChallengeEnabled(challenge.id)}
                    className={challenge.enabled ? 'text-green-400' : 'text-red-400'}
                  >
                    {challenge.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(challenge)}
                    className="text-neon-blue hover:text-neon-blue"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(challenge.id)}
                    className="text-destructive hover:text-destructive"
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