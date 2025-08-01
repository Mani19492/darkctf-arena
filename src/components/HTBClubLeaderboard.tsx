import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HTBClubEntry {
  username: string;
  user_id: string;
  total_points: number;
  solved_challenges: number;
  last_submission: string | null;
  rank: number;
}

const HTBClubLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<HTBClubEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHTBClubLeaderboard();
  }, []);

  const loadHTBClubLeaderboard = async () => {
    try {
      // For now, use mock data until we can properly call the function
      setLeaderboard([]);
    } catch (error) {
      console.error('Error loading HTB Club leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-400" />;
      default:
        return <div className="h-6 w-6 flex items-center justify-center text-lg font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'No submissions yet';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)}h ago`;
    } else {
      return `${Math.floor(minutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2 flex items-center justify-center">
          <Shield className="h-8 w-8 mr-3 text-neon-purple" />
          HTB Club Leaderboard
        </h1>
        <p className="text-muted-foreground">Elite HTB Club members ranked by skill</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
        <CardHeader>
          <CardTitle className="text-neon-purple flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            HTB Club Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No HTB Club members found. Be the first to join!
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border transition-all duration-300
                    ${entry.rank <= 3 
                      ? 'bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border-neon-purple shadow-neon' 
                      : 'bg-cyber-light border-muted hover:border-neon-purple'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(entry.rank)}
                    <div>
                      <div className="font-semibold text-foreground flex items-center">
                        {entry.username}
                        <Badge className="ml-2 bg-neon-purple text-cyber-dark text-xs">HTB</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Last solve: {formatTime(entry.last_submission)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neon-purple">
                      {entry.total_points}
                    </div>
                    <Badge variant="outline" className="text-xs border-neon-purple text-neon-purple">
                      {entry.solved_challenges} solves
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-purple">
                {leaderboard.length}
              </div>
              <div className="text-sm text-muted-foreground">HTB Club Members</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-blue">
                {leaderboard.reduce((sum, entry) => sum + entry.solved_challenges, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Solves</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-green">
                {leaderboard.length > 0 ? Math.max(...leaderboard.map(entry => entry.total_points)) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Highest Score</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HTBClubLeaderboard;