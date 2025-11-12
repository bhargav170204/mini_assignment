// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Shield } from 'lucide-react';

const Dashboard = () => {
  const { user: authUser, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        setLoading(true);

        // Call your protected backend endpoint which returns user info and role
        const res = await api.get('/auth/me');
        // Backend response shape: { success, data: { user: { id, email, fullName, createdAt, updatedAt, role } } }
        const backendUser = res?.data?.data?.user;

        if (backendUser) {
          // map backend fields to local profile + role
          setProfile({
            full_name: backendUser.fullName ?? backendUser.full_name ?? authUser?.fullName ?? '',
            email: backendUser.email ?? authUser?.email ?? '',
          });

          setUserRole(backendUser.role ?? (authUser?.role ?? 'user'));
        } else {
          // fallback to authUser from context if backend didn't return user
          if (authUser) {
            setProfile({
              full_name: authUser.fullName,
              email: authUser.email,
            });
            setUserRole(authUser.role ?? 'user');
          }
        }
      } catch (err) {
        console.error('Error fetching user for dashboard:', err);
        // fallback to authUser if available
        if (authUser) {
          setProfile({
            full_name: authUser.fullName,
            email: authUser.email,
          });
          setUserRole(authUser.role ?? 'user');
        } else {
          setProfile(null);
          setUserRole(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFromBackend();
    // only run when authUser changes
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isAdmin ? 'bg-gradient-accent' : 'bg-gradient-primary'}`}>
              {isAdmin ? (
                <Shield className="h-6 w-6 text-accent-foreground" />
              ) : (
                <User className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {profile?.full_name || authUser?.fullName || 'User'}
              </h1>
              <p className="text-muted-foreground capitalize">
                ({userRole || 'user'})
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Dashboard Content */}
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="shadow-medium border-border/50">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile?.full_name || authUser?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email || authUser?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{userRole || authUser?.role || 'user'}</p>
              </div>
            </CardContent>
          </Card>

          {isAdmin ? (
            <>
              <Card className="shadow-medium border-border/50 bg-gradient-to-br from-accent/5 to-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" />
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription>Administrator features and controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    As an admin, you have access to advanced features and management capabilities.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Users
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      System Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-border/50 md:col-span-2">
                <CardHeader>
                  <CardTitle>Admin Analytics</CardTitle>
                  <CardDescription>System overview and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">124</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Active Sessions</p>
                      <p className="text-2xl font-bold">89</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm text-muted-foreground">System Health</p>
                      <p className="text-2xl font-bold text-green-600">98%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Quick actions and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Welcome to your dashboard! Here you can manage your account and access features.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    View Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Help & Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
