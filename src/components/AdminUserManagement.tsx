import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Trash2, Shield, Users } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
  created_at: string;
}

const AdminUserManagement = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminForm, setNewAdminForm] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Fetch all admin users
  const fetchAdminUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive"
      });
    } else {
      setAdminUsers(data || []);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Create new admin user
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create admin account via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminForm.email,
        password: newAdminForm.password,
        options: {
          data: {
            username: newAdminForm.username,
            phone_number: newAdminForm.phone_number
          }
        }
      });

      if (authError) {
        toast({
          title: "Failed to create admin",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      // Update the profile to set as admin
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', authData.user.id);

        if (updateError) {
          toast({
            title: "Error",
            description: "Failed to set admin privileges",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Admin created successfully",
            description: `Admin user ${newAdminForm.username} has been created`
          });
          
          // Reset form and refresh list
          setNewAdminForm({ username: '', email: '', phone_number: '', password: '' });
          setShowForm(false);
          fetchAdminUsers();
        }
      }
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

  // Remove admin privileges (but don't delete the user)
  const handleRemoveAdmin = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to remove admin privileges from ${username}?`)) {
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove admin privileges",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Admin privileges removed",
        description: `${username} is no longer an administrator`
      });
      fetchAdminUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Admin User Management
          </h2>
          <p className="text-muted-foreground">Manage administrator accounts for the CTF platform</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Admin'}
        </Button>
      </div>

      {/* Create Admin Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Admin User</CardTitle>
            <CardDescription>
              Create a new administrator account with full platform access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input
                    id="new-username"
                    value={newAdminForm.username}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-phone">Phone Number</Label>
                  <Input
                    id="new-phone"
                    type="tel"
                    value={newAdminForm.phone_number}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, phone_number: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Admin...' : 'Create Admin User'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Admin Users List */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Current Administrators</h3>
        {adminUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No admin users found</p>
            </CardContent>
          </Card>
        ) : (
          adminUsers.map((admin) => (
            <Card key={admin.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{admin.username}</h4>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    {admin.phone_number && (
                      <p className="text-sm text-muted-foreground">{admin.phone_number}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin.id, admin.username)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;