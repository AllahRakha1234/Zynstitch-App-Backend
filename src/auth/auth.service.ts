import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ServiceMessages } from '../common/constants/service-messages.js';
import { fail, ok, type ApiResponse } from '../common/types/api-response.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.js';
import { UsersRepository } from '../users/users.repository.js';
import type { LoginDto } from './dto/login.schema.js';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  profilePhoto?: string;
  role: AuthenticatedUser['role'];
}

export interface IssuedAccessToken {
  token: string;
  expiresInSeconds: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async login(dto: LoginDto): Promise<{
    response: ApiResponse<AuthUserDto>;
    accessToken?: IssuedAccessToken;
  }> {
    const user = await this.usersRepository.findCredentialsByEmail(dto.email);

    if (!user?.password) {
      return { response: fail(ServiceMessages.invalidCredentials) };
    }

    if (user.status !== 'ACTIVE') {
      return { response: fail(ServiceMessages.accountBlocked) };
    }

    const passwordMatches = await compare(dto.password, user.password);
    if (!passwordMatches) {
      return { response: fail(ServiceMessages.invalidCredentials) };
    }

    const { token, jti } = await this.tokenService.signAccessToken({
      userId: user.id,
      role: user.role,
      status: user.status,
    });
    const expiresInSeconds = this.tokenService.expiresInSeconds;

    await this.sessionService.persistJwt(
      user.id,
      jti,
      token,
      expiresInSeconds,
    );

    return {
      response: ok(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          profilePhoto: user.profilePhoto,
          role: user.role,
        },
        ServiceMessages.loginSuccess,
      ),
      accessToken: { token, expiresInSeconds },
    };
  }

  async logout(token?: string | null): Promise<ApiResponse<null>> {
    if (token) {
      try {
        const payload = await this.tokenService.verifyAccessToken(token);
        await this.sessionService.revokeJwt(payload.sub, payload.jti);
      } catch {
        // Cookie/token may already be expired; still treat logout as success.
      }
    }

    return ok(null, 'Logged out');
  }

  toProfile(user: AuthenticatedUser): AuthUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      profilePhoto: user.profilePhoto,
      role: user.role,
    };
  }
}
