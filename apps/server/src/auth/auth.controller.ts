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
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthResponseDto, LoginDto, RegisterDto, UserInfoDto } from 'schemas';

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

  @ApiOperation({
    summary: 'User Registration',
    description:
      'Register a new user account with email, password, user name and user surname',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Registration failed',
  })
  @Post('register')
  async register(
    @Body() input: RegisterDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<AuthResponseDto> {
    const { accessToken } = await this.authService.register(input);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { success: true };
  }

  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user with email and password.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @Post('login')
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<AuthResponseDto> {
    const { accessToken } = await this.authService.login(input);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { success: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: ExpressResponse) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      path: '/',
    });

    return { success: true };
  }

  @ApiOperation({
    summary: 'Get User Profile',
    description: 'Get current authenticated user profile information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserInfoDto,
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserProfile(@Request() req): Promise<UserInfoDto> {
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    // Redirect to frontend page (token is now in cookie, no need in URL)
    return res.redirect(`${process.env.UI_APP_URL}`);
  }
}
