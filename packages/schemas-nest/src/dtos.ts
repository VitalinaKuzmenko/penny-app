import {
  authResponseSchema,
  CsvRowSchema,
  loginSchema,
  registerSchema,
  UserInfoSchema,
  ImportCsvResponseSchema,
} from 'schemas';
import { createZodDto } from 'nestjs-zod';

// AUTH
export class RegisterDto extends createZodDto(registerSchema) {}

export class LoginDto extends createZodDto(loginSchema) {}

export class UserInfoDto extends createZodDto(UserInfoSchema) {}

export class AuthResponseDto extends createZodDto(authResponseSchema) {}

// IMPORT
//TODO: check if needs to be removed
export class CsvRowDto extends createZodDto(CsvRowSchema) {}

export class ImportCsvResponseDto extends createZodDto(
  ImportCsvResponseSchema,
) {}
