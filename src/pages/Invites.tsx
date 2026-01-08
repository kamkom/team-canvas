import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Mail, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { InviteFormDialog } from '@/components/invites/InviteFormDialog';
import { invitesApi, teamsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function InvitesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: invites, isLoading, isError, refetch } = useQuery({
    queryKey: ['invites'],
    queryFn: invitesApi.getAll,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: teamsApi.getAll,
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => invitesApi.resend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      toast({ title: 'Invite resent', description: 'The invitation has been resent.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => invitesApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      toast({ title: 'Invite revoked', description: 'The invitation has been revoked.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => invitesApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Invite accepted', description: 'The invitation has been marked as accepted.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const getTeamNames = (teamIds: string[]) => {
    return teams
      .filter(t => teamIds.includes(t.id))
      .map(t => t.name)
      .join(', ') || '—';
  };

  return (
    <AppLayout
      title="Invites"
      actions={
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite user
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : invites?.length === 0 ? (
            <EmptyState
              icon={<Mail className="h-6 w-6" />}
              title="No invites yet"
              description="Send an invitation to add new users to your organization."
              action={
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite user
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites?.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={invite.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[150px] truncate">
                      {getTeamNames(invite.teamIds)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invite.sentAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invite.expiresAt
                        ? format(new Date(invite.expiresAt), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invite.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => resendMutation.mutate(invite.id)}
                                disabled={resendMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => acceptMutation.mutate(invite.id)}
                                disabled={acceptMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as accepted
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => revokeMutation.mutate(invite.id)}
                                disabled={revokeMutation.isPending}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Revoke
                              </DropdownMenuItem>
                            </>
                          )}
                          {invite.status === 'expired' && (
                            <DropdownMenuItem
                              onClick={() => resendMutation.mutate(invite.id)}
                              disabled={resendMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                          )}
                          {invite.status === 'revoked' && (
                            <DropdownMenuItem
                              onClick={() => resendMutation.mutate(invite.id)}
                              disabled={resendMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reinvite
                            </DropdownMenuItem>
                          )}
                          {invite.status === 'accepted' && (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              No actions available
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <InviteFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </AppLayout>
  );
}
