export const ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export const ADMIN_ROLES: readonly UserRole[] = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  email: string;
  companyName?: string;
  profilePhoto?: string;
}
