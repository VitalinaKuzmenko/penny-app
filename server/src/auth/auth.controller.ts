import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';

import { AuthService, UserInfo } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
}
