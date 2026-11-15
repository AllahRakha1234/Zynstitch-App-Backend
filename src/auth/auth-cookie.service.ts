import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';

export const ACCESS_TOKEN_COOKIE = 'access_token';

@Injectable()
export class AuthCookieService {
  private readonly cookieName: string;
  private readonly secure: boolean;
  private readonly sameSite: 'lax' | 'strict' | 'none';

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    configService: ConfigService,
  ) {
    this.cookieName =
      configService.get<string>('jwt.cookieName') ?? ACCESS_TOKEN_COOKIE;
    this.secure = configService.get<boolean>('jwt.cookieSecure') ?? false;
    this.sameSite =
      configService.get<'lax' | 'strict' | 'none'>('jwt.cookieSameSite') ??
      'lax';
  }

  get name() {
    return this.cookieName;
  }

  setAccessToken(response: unknown, token: string, maxAgeSeconds: number) {
    this.adapterHost.httpAdapter.setCookie(
      response,
      this.cookieName,
      token,
      this.options(maxAgeSeconds),
    );
  }

  clearAccessToken(response: unknown) {
    this.adapterHost.httpAdapter.clearCookie(
      response,
      this.cookieName,
      this.options(0),
    );
  }

  private options(maxAgeSeconds: number) {
    return {
      httpOnly: true,
      secure: this.secure,
      sameSite: this.sameSite,
      path: '/',
      maxAge: maxAgeSeconds,
    };
  }
}
