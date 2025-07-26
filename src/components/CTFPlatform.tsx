import React from 'react';
import { useCTFStore } from '@/lib/store';
import LoginForm from './LoginForm';
import Navbar from './Navbar';
import ChallengeList from './ChallengeList';
import Leaderboard from './Leaderboard';
import AdminPanel from './AdminPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Clock } from 'lucide-react';

const ProfileView: React.FC = () => {
  const { currentUser } = useCTFStore();
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
          User Profile
        </h1>
        <p className="text-muted-foreground">Your hacker profile and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Username</label>
              <div className="text-lg font-semibold text-neon-blue">{currentUser?.username}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="text-lg">{currentUser?.email}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <Badge className={currentUser?.isAdmin ? 'bg-neon-purple text-cyber-dark' : 'bg-neon-green text-cyber-dark'}>
                {currentUser?.isAdmin ? 'Administrator' : 'Hacker'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Challenges Solved</span>
                <Badge variant="outline" className="border-neon-blue text-neon-blue">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Points</span>
                <Badge variant="outline" className="border-neon-green text-neon-green">450</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Current Rank</span>
                <Badge variant="outline" className="border-neon-purple text-neon-purple">#1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CTFPlatform: React.FC = () => {
  const { isAuthenticated, currentView } = useCTFStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'challenges':
        return <ChallengeList />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return <ProfileView />;
      default:
        return <ChallengeList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default CTFPlatform;