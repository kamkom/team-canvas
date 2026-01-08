import { useQuery } from '@tanstack/react-query';
import { Users, UsersRound, Mail, UserCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usersApi, teamsApi, invitesApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: teamsApi.getAll,
  });

  const { data: invites, isLoading: invitesLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: invitesApi.getAll,
  });

  const stats = [
    {
      title: 'Total Users',
      value: users?.length ?? 0,
      icon: Users,
      description: 'Active user accounts',
    },
    {
      title: 'Active Users',
      value: users?.filter(u => u.status === 'active').length ?? 0,
      icon: UserCheck,
      description: 'Currently active',
    },
    {
      title: 'Teams',
      value: teams?.length ?? 0,
      icon: UsersRound,
      description: 'Organized groups',
    },
    {
      title: 'Pending Invites',
      value: invites?.filter(i => i.status === 'pending').length ?? 0,
      icon: Mail,
      description: 'Awaiting response',
    },
  ];

  const isLoading = usersLoading || teamsLoading || invitesLoading;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Here's an overview of your organization's user management.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                User management activity will appear here in a production environment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use the sidebar to navigate to Users, Teams, or Invites to manage your organization.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
