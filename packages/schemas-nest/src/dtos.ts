import {
  authResponseSchema,
  CsvRowSchema,
  loginSchema,
  registerSchema,
  UserInfoSchema,
} from 'schemas';
import { createZodDto } from 'nestjs-zod';

// AUTH
export class RegisterDto extends createZodDto(registerSchema) {}

export class LoginDto extends createZodDto(loginSchema) {}

export class UserInfoDto extends createZodDto(UserInfoSchema) {}

export class AuthResponseDto extends createZodDto(authResponseSchema) {}

// IMPORT
export class CsvRowDto extends createZodDto(CsvRowSchema) {}
