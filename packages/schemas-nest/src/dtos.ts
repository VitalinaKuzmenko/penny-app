import {
  AuthResponseSchema,
  CsvImportResponseSchema,
  LoginSchema,
  RegisterSchema,
  UserInfoSchema,
  ImportCsvResponseSchema,
  ConfirmImportResponseSchema,
  ConfirmImportSchema,
  AccountSchema,
  CreateAccountSchema,
  GetCurrenciesResponseSchema,
  GetCategoriesResponseSchema,
} from 'schemas';
import { createZodDto } from 'nestjs-zod';

// AUTH
export class RegisterDto extends createZodDto(RegisterSchema) {}

export class LoginDto extends createZodDto(LoginSchema) {}

export class UserInfoDto extends createZodDto(UserInfoSchema) {}

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}

// IMPORT
export class CsvImportResponseDTO extends createZodDto(
  CsvImportResponseSchema,
) {}

export class ImportCsvResponseDto extends createZodDto(
  ImportCsvResponseSchema,
) {}

export class ConfirmImportDto extends createZodDto(ConfirmImportSchema) {}

export class ConfirmImportResponseDto extends createZodDto(
  ConfirmImportResponseSchema,
) {}

// ACCOUNTS
export class AccountDto extends createZodDto(AccountSchema) {}
export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}

// CURRENCY
export class GetCurrenciesResponseDto extends createZodDto(
  GetCurrenciesResponseSchema,
) {}

export class GetCategoriesResponseDto extends createZodDto(
  GetCategoriesResponseSchema,
) {}
