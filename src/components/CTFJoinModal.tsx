import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CTFJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CTFJoinModal = ({ isOpen, onClose, onSuccess }: CTFJoinModalProps) => {
  const [ctfCode, setCTFCode] = useState('');
  const [teamMode, setTeamMode] = useState<'solo' | 'team'>('team');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoinCTF = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, find the CTF event by code
      const { data: ctfEvent, error: ctfError } = await supabase
        .from('ctf_events')
        .select('*')
        .eq('ctf_code', ctfCode.toUpperCase())
        .eq('enabled', true)
        .single();

      if (ctfError || !ctfEvent) {
        toast({
          title: "CTF not found",
          description: "Invalid CTF code or the event is not active",
          variant: "destructive"
        });
        return;
      }

      // Check if CTF is still active
      const now = new Date();
      const startTime = new Date(ctfEvent.start_time);
      const endTime = new Date(ctfEvent.end_time);

      if (now < startTime) {
        toast({
          title: "CTF not started",
          description: "This CTF hasn't started yet",
          variant: "destructive"
        });
        return;
      }

      if (now > endTime) {
        toast({
          title: "CTF ended",
          description: "This CTF has already ended",
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to join a CTF",
          variant: "destructive"
        });
        return;
      }

      // Check if user is already in a team for this CTF
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select(`
          *,
          teams!inner(ctf_event_id)
        `)
        .eq('user_id', user.id)
        .eq('teams.ctf_event_id', ctfEvent.id);

      if (existingMembership && existingMembership.length > 0) {
        toast({
          title: "Already joined",
          description: "You're already participating in this CTF",
          variant: "destructive"
        });
        return;
      }

      let teamId: string;

      if (teamMode === 'solo') {
        // Create a solo team
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        const soloTeamName = `${profile?.username || 'Solo'} (Solo)`;

        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            name: soloTeamName,
            ctf_event_id: ctfEvent.id,
            is_solo: true
          })
          .select()
          .single();

        if (teamError) {
          toast({
            title: "Error creating team",
            description: teamError.message,
            variant: "destructive"
          });
          return;
        }

        teamId = newTeam.id;
      } else {
        // Create or join a team
        if (!teamName.trim()) {
          toast({
            title: "Team name required",
            description: "Please enter a team name",
            variant: "destructive"
          });
          return;
        }

        // Try to find existing team with this name
        const { data: existingTeam } = await supabase
          .from('teams')
          .select('*')
          .eq('name', teamName.trim())
          .eq('ctf_event_id', ctfEvent.id)
          .eq('is_solo', false)
          .single();

        if (existingTeam) {
          teamId = existingTeam.id;
        } else {
          // Create new team
          const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert({
              name: teamName.trim(),
              ctf_event_id: ctfEvent.id,
              is_solo: false
            })
            .select()
            .single();

          if (teamError) {
            toast({
              title: "Error creating team",
              description: teamError.message,
              variant: "destructive"
            });
            return;
          }

          teamId = newTeam.id;
        }
      }

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id
        });

      if (memberError) {
        toast({
          title: "Error joining team",
          description: memberError.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: `Successfully joined ${ctfEvent.name}${teamMode === 'team' ? ` as team "${teamName}"` : ' as a solo participant'}`
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join CTF Competition</DialogTitle>
          <DialogDescription>
            Enter the CTF code and choose your participation mode
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleJoinCTF} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ctf-code">CTF Code</Label>
            <Input
              id="ctf-code"
              type="text"
              value={ctfCode}
              onChange={(e) => setCTFCode(e.target.value.toUpperCase())}
              placeholder="Enter CTF code"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Participation Mode</Label>
            <RadioGroup value={teamMode} onValueChange={(value: 'solo' | 'team') => setTeamMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4" />
                  Team Competition
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo" id="solo" />
                <Label htmlFor="solo" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Solo Competition
                </Label>
              </div>
            </RadioGroup>
          </div>

          {teamMode === 'team' && (
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name (join existing or create new)"
                required
              />
              <p className="text-sm text-muted-foreground">
                If a team with this name exists, you'll join it. Otherwise, a new team will be created.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Joining..." : "Join CTF"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CTFJoinModal;