import React, { useState, useEffect } from 'react';
import { useCTFStore } from '@/lib/store';
import Navbar from './Navbar';
import ChallengeList from './ChallengeList';
import Leaderboard from './Leaderboard';
import AdminPanel from './AdminPanel';
import HTBClubLeaderboard from './HTBClubLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProfileView: React.FC = () => {
  const { currentUser, isAdmin } = useCTFStore();
  const [profile, setProfile] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
        });
    }
  }, [currentUser]);

  const handleHTBClubRequest = async () => {
    if (!currentUser) return;
    
    try {
      const updateData: any = {
        htb_club_request_status: 'pending',
        htb_club_requested_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) {
        setRequestStatus('Error submitting request');
      } else {
        setRequestStatus('Request submitted successfully!');
        setProfile(prev => ({ ...prev, htb_club_request_status: 'pending' }));
      }
    } catch (error) {
      setRequestStatus('Error submitting request');
    }
  };
  
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
              <div className="text-lg font-semibold text-neon-blue">{profile?.username || 'Loading...'}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone Number</label>
              <div className="text-lg">{profile?.phone_number || 'Not provided'}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="text-lg">{currentUser?.email}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <div className="flex flex-wrap gap-2">
                <Badge className={isAdmin ? 'bg-neon-purple text-cyber-dark' : 'bg-neon-green text-cyber-dark'}>
                  {isAdmin ? 'Administrator' : 'Hacker'}
                </Badge>
                {profile?.htb_club_member && (
                  <Badge className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                    HTB Club Member
                  </Badge>
                )}
              </div>
            </div>
            
            {!profile?.htb_club_member && (
              <div className="border-t border-muted pt-4">
                <label className="text-sm text-muted-foreground">HTB Club Membership</label>
                {profile?.htb_club_request_status === 'pending' ? (
                  <div className="mt-2">
                    <Badge className="bg-yellow-500 text-black">Request Pending</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your HTB Club membership request is under review.
                    </p>
                  </div>
                ) : profile?.htb_club_request_status === 'rejected' ? (
                  <div className="mt-2">
                    <Badge className="bg-red-500 text-white">Request Rejected</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your HTB Club membership request was rejected.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <button 
                      onClick={handleHTBClubRequest}
                      className="px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg transition-colors"
                    >
                      Request HTB Club Membership
                    </button>
                    {requestStatus && (
                      <p className="text-sm mt-2 text-muted-foreground">{requestStatus}</p>
                    )}
                  </div>
                )}
              </div>
            )}
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
    // Redirect to home page for authentication
    window.location.href = '/';
    return null;
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
      case 'admin-users':
        const AdminUserManagement = React.lazy(() => import('./AdminUserManagement'));
        return <React.Suspense fallback={<div>Loading...</div>}><AdminUserManagement /></React.Suspense>;
      case 'htb-leaderboard':
        return <HTBClubLeaderboard />;
      case 'admin-htb':
        const AdminHTBClubRequests = React.lazy(() => import('./AdminHTBClubRequests'));
        return <React.Suspense fallback={<div>Loading...</div>}><AdminHTBClubRequests /></React.Suspense>;
      case 'admin-reset':
        const AdminResetPanel = React.lazy(() => import('./AdminResetPanel'));
        return <React.Suspense fallback={<div>Loading...</div>}><AdminResetPanel /></React.Suspense>;
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