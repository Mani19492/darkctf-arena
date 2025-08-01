import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface HTBClubRequest {
  id: string;
  username: string;
  email: string;
  htb_club_request_status: string;
  htb_club_requested_at: string;
}

const AdminHTBClubRequests: React.FC = () => {
  const [requests, setRequests] = useState<HTBClubRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('htb_club_request_status', 'is', null);

      if (error) {
        console.error('Error loading HTB Club requests:', error);
      } else {
        setRequests((data as any) || []);
      }
    } catch (error) {
      console.error('Error loading HTB Club requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (userId: string, action: 'approved' | 'rejected') => {
    try {
      const updateData: any = {
        htb_club_request_status: action,
        htb_club_member: action === 'approved'
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        toast({
          title: "Error",
          description: `Failed to ${action} request`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Request ${action} successfully`,
        });
        loadRequests(); // Reload the list
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          HTB Club Requests
        </h1>
        <p className="text-muted-foreground">Manage HTB Club membership requests</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-cyber-light">
        <CardHeader>
          <CardTitle className="text-neon-purple flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Membership Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No HTB Club requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-cyber-light border-muted"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">
                      {request.username}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requested: {formatDate(request.htb_club_requested_at)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={
                        request.htb_club_request_status === 'pending' ? 'bg-yellow-500 text-black' :
                        request.htb_club_request_status === 'approved' ? 'bg-green-500 text-white' :
                        'bg-red-500 text-white'
                      }
                    >
                      {request.htb_club_request_status}
                    </Badge>
                    
                    {request.htb_club_request_status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequest(request.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequest(request.id, 'rejected')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHTBClubRequests;