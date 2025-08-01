import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Clock } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  points: number;
  lastSubmission: Date;
  solvedChallenges: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
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

  const formatTime = (date: Date) => {
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">Elite hackers ranked by skill</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
        <CardHeader>
          <CardTitle className="text-neon-green flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Team Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teams have submitted solutions yet. Be the first!
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`
                  flex items-center justify-between p-4 rounded-lg border transition-all duration-300
                  ${entry.rank <= 3 
                    ? 'bg-gradient-to-r from-neon-green/10 to-neon-blue/10 border-neon-green shadow-neon' 
                    : 'bg-cyber-light border-muted hover:border-neon-blue'
                  }
                `}
              >
                <div className="flex items-center space-x-4">
                  {getRankIcon(entry.rank)}
                  <div>
                    <div className="font-semibold text-foreground">
                      {entry.teamName}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Last solve: {formatTime(entry.lastSubmission)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-neon-blue">
                    {entry.points}
                  </div>
                  <Badge variant="outline" className="text-xs border-muted">
                    {entry.solvedChallenges} solves
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
              <div className="text-3xl font-bold text-neon-green">
                {leaderboard.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Teams</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-blue">
                {leaderboard.reduce((sum, entry) => sum + entry.solvedChallenges, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Solves</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-purple">
                {leaderboard.length > 0 ? Math.max(...leaderboard.map(entry => entry.points)) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Highest Score</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;