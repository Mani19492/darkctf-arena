import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Trash2 } from 'lucide-react';

const AdminResetPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Reset all team points to 0
      await supabase
        .from('teams')
        .update({ points: 0, updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Delete all submissions
      await supabase
        .from('submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Reset challenge solve counts
      await supabase
        .from('challenges')
        .update({ updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Leaderboard Reset",
        description: "All scores and submissions have been reset successfully.",
      });
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset leaderboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetChallenges = async () => {
    setIsLoading(true);
    try {
      // First delete all submissions related to challenges
      await supabase
        .from('submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Reset team points
      await supabase
        .from('teams')
        .update({ points: 0, updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Delete all challenges
      await supabase
        .from('challenges')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Challenges Reset",
        description: "All challenges and related data have been reset successfully.",
      });
    } catch (error) {
      console.error('Error resetting challenges:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset challenges. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
          Competition Reset Panel
        </h1>
        <p className="text-muted-foreground">Manage monthly competition resets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardHeader>
            <CardTitle className="text-neon-blue flex items-center">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Reset all team scores and submissions while keeping challenges intact. 
              Perfect for starting a new competition cycle.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Leaderboard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Leaderboard?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all team scores to 0 and delete all submissions. 
                    Challenges will remain intact. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetLeaderboard} disabled={isLoading}>
                    Reset Leaderboard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Reset Everything
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete reset of all challenges, submissions, and scores. 
              Use this to start completely fresh with new challenges.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Everything
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete ALL challenges, submissions, and reset all team scores. 
                    This is a complete reset and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetChallenges} disabled={isLoading}>
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
        <CardHeader>
          <CardTitle className="text-neon-green">Reset Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Leaderboard Reset:</strong> Use this monthly to start new competition cycles</p>
            <p>• <strong>Complete Reset:</strong> Use this when you want to change all challenges</p>
            <p>• <strong>Timing:</strong> Recommend doing resets at the beginning of each month</p>
            <p>• <strong>Backup:</strong> Consider exporting results before resetting</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResetPanel;