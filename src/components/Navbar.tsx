import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCTFStore } from '@/lib/store';
import { Terminal, Shield, User, LogOut, Settings, Users, Crown, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Navbar: React.FC = () => {
  const { currentUser, isAdmin, logout, currentView, setCurrentView } = useCTFStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      supabase
        .from('profiles')
        .select('username')
        .eq('id', currentUser.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
        });
    }
  }, [currentUser]);

  const navItems = [
    { id: 'challenges', label: 'Challenges', icon: Terminal },
    { id: 'leaderboard', label: 'Leaderboard', icon: Shield },
    { id: 'htb-leaderboard', label: 'HTB Club', icon: Crown },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push(
      { id: 'admin', label: 'CTF Admin', icon: Settings },
      { id: 'admin-users', label: 'User Admin', icon: Users },
      { id: 'admin-htb', label: 'HTB Requests', icon: Shield },
      { id: 'admin-reset', label: 'Reset Panel', icon: RotateCcw }
    );
  }

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-cyber-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <Terminal className="h-8 w-8 text-neon-green shadow-neon" />
              <span className="ml-2 text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                HTBAU
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    ${currentView === item.id 
                      ? 'bg-neon-green text-cyber-dark shadow-neon' 
                      : 'text-foreground hover:text-neon-green hover:bg-cyber-light'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
            
            <div className="text-sm text-muted-foreground">
              Welcome, <span className="text-neon-blue font-semibold">{profile?.username || 'User'}</span>
            </div>
            
            <Button
              variant="ghost"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;