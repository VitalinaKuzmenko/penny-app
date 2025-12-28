import { createZodDto } from 'nestjs-zod';
import { registerSchema } from './auth/register.schema';
import { loginSchema } from './auth/login.schema';
import { UserInfoSchema } from './auth/userInfo.schema';
import { authResponseSchema } from './auth/authResponse.schema';

// AUTH
export class RegisterDto extends createZodDto(registerSchema) {}

export class LoginDto extends createZodDto(loginSchema) {}

export class UserInfoDto extends createZodDto(UserInfoSchema) {}

export class AuthResponseDto extends createZodDto(authResponseSchema) {}
