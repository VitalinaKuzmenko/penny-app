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
  AccountWithActivitySchema,
  CreateAccountSchema,
  GetCurrenciesResponseSchema,
  CategorySchema,
  GetIncomeExpenseQuerySchema,
  GetIncomeExpenseResponseSchema,
  MonthlyCategoryQuerySchema,
  MonthlyCategoryResponseSchema,
  CategoryBreakdownQuerySchema,
  CategoryBreakdownResponseSchema,
  IncomeExpenseStackedQuerySchema,
  IncomeExpenseStackedResponseSchema,
  IncomeExpenseRatioQuerySchema,
  IncomeExpenseRatioResponseSchema,
  TagSpendQuerySchema,
  TagSpendResponseSchema,
  TagSchema,
  ListTransactionsQuerySchema,
  ListTransactionsResponseSchema,
  UpdateTransactionsSchema,
  UpdateTransactionsResponseSchema,
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
export class AccountWithActivityDto extends createZodDto(
  AccountWithActivitySchema,
) {}
export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}

// CURRENCY
export class GetCurrenciesResponseDto extends createZodDto(
  GetCurrenciesResponseSchema,
) {}

// CATEGORY
export class CategoryDto extends createZodDto(CategorySchema) {}

// CHARTS
export class GetIncomeExpenseQueryDto extends createZodDto(
  GetIncomeExpenseQuerySchema,
) {}

export class GetIncomeExpenseResponseDto extends createZodDto(
  GetIncomeExpenseResponseSchema,
) {}
export class MonthlyCategoryQueryDto extends createZodDto(
  MonthlyCategoryQuerySchema,
) {}

export class MonthlyCategoryResponseDto extends createZodDto(
  MonthlyCategoryResponseSchema,
) {}

export class CategoryBreakdownQueryDto extends createZodDto(
  CategoryBreakdownQuerySchema,
) {}
export class CategoryBreakdownResponseDto extends createZodDto(
  CategoryBreakdownResponseSchema,
) {}
export class IncomeExpenseStackedQueryDto extends createZodDto(
  IncomeExpenseStackedQuerySchema,
) {}
export class IncomeExpenseStackedResponseDto extends createZodDto(
  IncomeExpenseStackedResponseSchema,
) {}
export class IncomeExpenseRatioQueryDto extends createZodDto(
  IncomeExpenseRatioQuerySchema,
) {}
export class IncomeExpenseRatioResponseDto extends createZodDto(
  IncomeExpenseRatioResponseSchema,
) {}
export class TagSpendQueryDto extends createZodDto(TagSpendQuerySchema) {}
export class TagSpendResponseDto extends createZodDto(TagSpendResponseSchema) {}

// TAGS
export class TagDto extends createZodDto(TagSchema) {}

// TRANSACTIONS (Money Journal)
export class ListTransactionsQueryDto extends createZodDto(
  ListTransactionsQuerySchema,
) {}
export class ListTransactionsResponseDto extends createZodDto(
  ListTransactionsResponseSchema,
) {}
export class UpdateTransactionsDto extends createZodDto(
  UpdateTransactionsSchema,
) {}
export class UpdateTransactionsResponseDto extends createZodDto(
  UpdateTransactionsResponseSchema,
) {}
