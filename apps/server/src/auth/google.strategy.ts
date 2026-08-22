import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { id, emails, name } = profile;
      const user = await this.authService.validateOAuthLogin({
        provider: 'google',
        providerId: id,
        email: emails[0].value,
        userName: name.givenName,
        userSurname: name.familyName,
      });

      done(null, user);
    } catch (err) {
      if (err instanceof ConflictException) {
        // Pass error code as part of the user object so the controller can redirect with it
        const code = (err.getResponse() as Record<string, string>)?.code ?? 'auth.error';
        done(null, { oauthError: code });
      } else {
        done(err as Error, false);
      }
    }
  }
}
