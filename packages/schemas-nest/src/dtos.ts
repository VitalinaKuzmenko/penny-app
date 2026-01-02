import {
  authResponseSchema,
  CsvRowSchema,
  loginSchema,
  registerSchema,
  UserInfoSchema,
  ImportCsvResponseSchema,
  ConfirmImportResponseSchema,
  ConfirmImportSchema,
} from 'schemas';
import { createZodDto } from 'nestjs-zod';

// AUTH
export class RegisterDto extends createZodDto(registerSchema) {}

export class LoginDto extends createZodDto(loginSchema) {}

export class UserInfoDto extends createZodDto(UserInfoSchema) {}

export class AuthResponseDto extends createZodDto(authResponseSchema) {}

// IMPORT
export class CsvRowDto extends createZodDto(CsvRowSchema) {}

export class ImportCsvResponseDto extends createZodDto(
  ImportCsvResponseSchema,
) {}

export class ConfirmImportDto extends createZodDto(ConfirmImportSchema) {}

export class ConfirmImportResponseDto extends createZodDto(
  ConfirmImportResponseSchema,
) {}
