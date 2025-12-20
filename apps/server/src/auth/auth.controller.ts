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

import { AuthService, UserInfo } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
  register(@Body() input: RegisterDto): Promise<{ accessToken: string }> {
    return this.authService.register(input);
  }

  @Post('login')
  login(@Body() input: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(input);
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
    const jwt = req.user['accessToken'];

    // Set HTTP-only cookie
    res.cookie('access_token', jwt, {
      httpOnly: true, // Not accessible by JS
      secure: process.env.NODE_ENV === 'production', // only over HTTPS
      sameSite: 'lax', // CSRF protection
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    // Redirect to frontend page (token is now in cookie, no need in URL)
    return res.redirect(`${process.env.UI_APP_URL}`);
  }
}
