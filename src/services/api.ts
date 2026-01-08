import { User, Team, Invite, AuthSession, UserStatus, InviteStatus } from '@/types';
import { mockUsers, mockTeams, mockInvites } from './mockData';

// In-memory store
let users = [...mockUsers];
let teams = [...mockTeams];
let invites = [...mockInvites];

// Simulate network delay
const delay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 300));

// Error injection (set to true for testing)
const INJECT_ERRORS = false;
const ERROR_RATE = 0.1;

const maybeThrowError = () => {
  if (INJECT_ERRORS && Math.random() < ERROR_RATE) {
    throw new Error('Network error: Please try again');
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    await delay(600);
    
    if (email === 'admin@company.com' && password === 'password') {
      const session: AuthSession = {
        token: 'mock-jwt-token-' + Date.now(),
        user: { email, name: 'Admin User' },
      };
      localStorage.setItem('auth_session', JSON.stringify(session));
      return session;
    }
    
    // Accept any non-empty credentials for demo
    if (email && password) {
      const session: AuthSession = {
        token: 'mock-jwt-token-' + Date.now(),
        user: { email, name: email.split('@')[0] },
      };
      localStorage.setItem('auth_session', JSON.stringify(session));
      return session;
    }
    
    throw new Error('Invalid credentials');
  },

  logout: async (): Promise<void> => {
    await delay(200);
    localStorage.removeItem('auth_session');
  },

  getSession: (): AuthSession | null => {
    const stored = localStorage.getItem('auth_session');
    return stored ? JSON.parse(stored) : null;
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: {
    search?: string;
    status?: UserStatus | 'all';
    teamId?: string;
    department?: string;
  }): Promise<User[]> => {
    await delay();
    maybeThrowError();

    let filtered = [...users];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(u => u.status === params.status);
    }

    if (params?.teamId) {
      filtered = filtered.filter(u => u.teamIds.includes(params.teamId!));
    }

    if (params?.department) {
      filtered = filtered.filter(u => u.department === params.department);
    }

    return filtered;
  },

  getById: async (id: string): Promise<User> => {
    await delay();
    maybeThrowError();

    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  create: async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    await delay(500);
    maybeThrowError();

    const newUser: User = {
      ...data,
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    // Update team memberIds
    data.teamIds.forEach(teamId => {
      const team = teams.find(t => t.id === teamId);
      if (team && !team.memberIds.includes(newUser.id)) {
        team.memberIds.push(newUser.id);
      }
    });

    return newUser;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(500);
    maybeThrowError();

    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const oldUser = users[index];
    const updatedUser = { ...oldUser, ...data };
    users[index] = updatedUser;

    // Update team memberships
    if (data.teamIds) {
      teams.forEach(team => {
        const wasInTeam = oldUser.teamIds.includes(team.id);
        const isInTeam = data.teamIds!.includes(team.id);

        if (wasInTeam && !isInTeam) {
          team.memberIds = team.memberIds.filter(m => m !== id);
        } else if (!wasInTeam && isInTeam) {
          team.memberIds.push(id);
        }
      });
    }

    return updatedUser;
  },

  updateStatus: async (id: string, status: UserStatus): Promise<User> => {
    await delay(400);
    maybeThrowError();

    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], status };
    return users[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    maybeThrowError();

    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    users.splice(index, 1);

    // Remove from teams
    teams.forEach(team => {
      team.memberIds = team.memberIds.filter(m => m !== id);
    });
  },
};

// Teams API
export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    await delay();
    maybeThrowError();
    return [...teams];
  },

  getById: async (id: string): Promise<Team> => {
    await delay();
    maybeThrowError();

    const team = teams.find(t => t.id === id);
    if (!team) throw new Error('Team not found');
    return team;
  },

  create: async (data: Omit<Team, 'id' | 'createdAt' | 'memberIds'>): Promise<Team> => {
    await delay(500);
    maybeThrowError();

    const newTeam: Team = {
      ...data,
      id: 'team-' + Date.now(),
      memberIds: [],
      createdAt: new Date().toISOString(),
    };
    teams.push(newTeam);
    return newTeam;
  },

  update: async (id: string, data: Partial<Team>): Promise<Team> => {
    await delay(500);
    maybeThrowError();

    const index = teams.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Team not found');

    teams[index] = { ...teams[index], ...data };
    return teams[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    maybeThrowError();

    const index = teams.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Team not found');

    teams.splice(index, 1);

    // Remove team from users
    users.forEach(user => {
      user.teamIds = user.teamIds.filter(t => t !== id);
    });
  },

  updateMembers: async (id: string, memberIds: string[]): Promise<Team> => {
    await delay(400);
    maybeThrowError();

    const index = teams.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Team not found');

    const oldMemberIds = teams[index].memberIds;
    teams[index].memberIds = memberIds;

    // Update user teamIds
    users.forEach(user => {
      const wasInTeam = oldMemberIds.includes(user.id);
      const isInTeam = memberIds.includes(user.id);

      if (wasInTeam && !isInTeam) {
        user.teamIds = user.teamIds.filter(t => t !== id);
      } else if (!wasInTeam && isInTeam) {
        user.teamIds.push(id);
      }
    });

    return teams[index];
  },
};

// Invites API
export const invitesApi = {
  getAll: async (): Promise<Invite[]> => {
    await delay();
    maybeThrowError();
    return [...invites];
  },

  create: async (data: { email: string; teamIds: string[] }): Promise<Invite> => {
    await delay(500);
    maybeThrowError();

    const newInvite: Invite = {
      id: 'invite-' + Date.now(),
      email: data.email,
      status: 'pending',
      teamIds: data.teamIds,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    invites.push(newInvite);

    // Create placeholder user
    const newUser: User = {
      id: 'user-' + Date.now(),
      firstName: data.email.split('@')[0],
      lastName: '',
      email: data.email,
      status: 'invited',
      teamIds: data.teamIds,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    return newInvite;
  },

  resend: async (id: string): Promise<Invite> => {
    await delay(400);
    maybeThrowError();

    const index = invites.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invite not found');

    invites[index] = {
      ...invites[index],
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    };
    return invites[index];
  },

  revoke: async (id: string): Promise<Invite> => {
    await delay(400);
    maybeThrowError();

    const index = invites.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invite not found');

    invites[index] = { ...invites[index], status: 'revoked' };
    return invites[index];
  },

  accept: async (id: string): Promise<Invite> => {
    await delay(400);
    maybeThrowError();

    const index = invites.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invite not found');

    invites[index] = { ...invites[index], status: 'accepted' };

    // Update user status
    const userIndex = users.findIndex(u => u.email === invites[index].email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], status: 'active' };
    }

    return invites[index];
  },
};

// Helper to get departments
export const getDepartments = (): string[] => {
  const deps = new Set(users.map(u => u.department).filter(Boolean) as string[]);
  return Array.from(deps);
};
