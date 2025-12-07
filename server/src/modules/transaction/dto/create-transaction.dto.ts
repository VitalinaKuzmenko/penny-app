import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import {
  Currency,
  TransactionType,
} from '../../../prisma/generated/prisma/client';

export class CreateTransactionDto {
  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDateString()
  date: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  accountId: string;
}
