import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { LoginInput, RegisterInput, UserInfo } from 'schemas';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

export interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    accessToken: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() input: RegisterInput,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ success: true }> {
    const { accessToken } = await this.authService.register(input);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { success: true };
  }

  @Post('login')
  async login(
    @Body() input: LoginInput,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken } = await this.authService.login(input);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { message: 'Logged in successfully' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: ExpressResponse) {
    res.clearCookie('access_token', { path: '/' });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserProfile(@Request() req): Promise<UserInfo> {
    return this.authService.getUserProfile(req.user.userId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: ExpressResponse,
  ) {
    const jwt = req.user.accessToken;

    // Set HTTP-only cookie
    res.cookie('access_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    // Redirect to frontend page (token is now in cookie, no need in URL)
    return res.redirect(`${process.env.UI_APP_URL}`);
  }
}
