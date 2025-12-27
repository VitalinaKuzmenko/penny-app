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

  // ---------------- REGISTER ----------------
  @ApiOperation({
    summary: 'User Registration',
    description:
      'Register a new user account with email, password, user name and user surname. ' +
      'The access_token is returned as an **HTTP-only cookie** and is not visible in Swagger.',
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

  // ---------------- LOGIN ----------------
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password. ' +
      'The access_token is returned as an **HTTP-only cookie** and is not visible in Swagger.',
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

  // ---------------- LOGOUT ----------------
  @ApiOperation({
    summary: 'User Logout',
    description: 'Cannot test cookies removal directly in Swagger ',
  })
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: ExpressResponse) {
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

  // ---------------- PROFILE ----------------
  @ApiOperation({
    summary: 'Get User Profile',
    description:
      'Get current authenticated user profile information. ' +
      'You must provide the access_token in the **Authorization header** as Bearer token, ' +
      'or rely on the HTTP-only cookie if your client supports cookies.',
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

  // ---------------- GOOGLE OAUTH ----------------
  @ApiOperation({
    summary: 'Google OAuth Login',
    description: 'Cannot test Google OAuth flow directly in Swagger ',
  })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates Google OAuth flow
  }

  @ApiOperation({
    summary: 'Google OAuth Callback',
    description: 'Cannot test Google OAuth callback directly in Swagger ',
  })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: ExpressResponse,
  ) {
    const accessToken = req.user.accessToken;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.DOMAIN === 'localhost' ? undefined : process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });

    return res.redirect(`${process.env.UI_APP_URL}`);
  }
}
