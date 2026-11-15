import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ok } from '../common/types/api-response.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService } from './auth.service.js';
import { loginSchema, type LoginDto } from './dto/login.schema.js';
import { extractAccessToken } from './extract-access-token.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body({ schema: loginSchema }) dto: LoginDto,
    @Res({ passthrough: true }) response: unknown,
  ) {
    const { response: result, accessToken } = await this.authService.login(dto);

    if (result.success && accessToken) {
      this.authCookieService.setAccessToken(
        response,
        accessToken.token,
        accessToken.expiresInSeconds,
      );
    }

    return result;
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return ok(this.authService.toProfile(user), 'OK');
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: unknown,
  ) {
    const token = extractAccessToken(request.headers, this.authCookieService.name);
    const result = await this.authService.logout(token);
    this.authCookieService.clearAccessToken(response);
    return result;
  }
}
