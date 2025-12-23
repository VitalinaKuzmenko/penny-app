import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // Passport JWT strategy automatically reads from header by default
    // To read from cookie, you can override jwtFromRequest:
    // passport-jwt options: jwtFromRequest: ExtractJwt.fromExtractors([
    //   req => req?.cookies?.access_token
    // ])
    return req;
  }
}
