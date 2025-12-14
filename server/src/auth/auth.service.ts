import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../prisma/generated/prisma/client';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    userName?: string,
    userSurname?: string,
  ) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(
      email,
      passwordHash,
      userName,
      userSurname,
    );

    return this.signToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user);
  }

  private signToken(user: User) {
    const payload = { sub: user.id, email: user.userEmail };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
