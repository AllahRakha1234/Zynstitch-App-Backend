import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator.js';
import { ServiceMessages } from '../../common/constants/service-messages.js';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.js';
import { UsersRepository } from '../../users/users.repository.js';
import { AuthCookieService } from '../auth-cookie.service.js';
import { extractAccessToken } from '../extract-access-token.js';
import { SessionService } from '../session.service.js';
import { TokenService } from '../token.service.js';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly usersRepository: UsersRepository,
    private readonly authCookieService: AuthCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = extractAccessToken(
      request.headers,
      this.authCookieService.name,
    );
    if (!token) {
      throw new UnauthorizedException(ServiceMessages.unauthorized);
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      const sessionActive = await this.sessionService.isJwtActive(
        payload.sub,
        payload.jti,
        token,
      );
      if (!sessionActive) {
        throw new UnauthorizedException(ServiceMessages.unauthorized);
      }

      const user = await this.usersRepository.findById(payload.sub);
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException(ServiceMessages.unauthorized);
      }

      request.user = {
        id: user.id,
        role: user.role,
        status: user.status,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        profilePhoto: user.profilePhoto,
      };

      return true;
    } catch {
      throw new UnauthorizedException(ServiceMessages.unauthorized);
    }
  }
}
