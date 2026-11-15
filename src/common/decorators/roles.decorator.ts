import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../types/authenticated-user.js';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: readonly UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
