export type UserStatus = 'invited' | 'active' | 'suspended';
export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  status: UserStatus;
  teamIds: string[];
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdAt: string;
}

export interface Invite {
  id: string;
  email: string;
  status: InviteStatus;
  teamIds: string[];
  sentAt: string;
  expiresAt?: string;
}

export interface AuthSession {
  token: string;
  user: {
    email: string;
    name: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
}
