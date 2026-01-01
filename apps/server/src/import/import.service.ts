// src/import/import.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowSchema } from 'schemas';
import { ImportCsvResponseDto } from 'schemas-nest';

import { PrismaService } from '../prisma/prisma.service';
import { WinstonLogger } from '../utils/logger/logger';
import { parseDate } from '../utils/parse-date';

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLogger,
  ) {}

  async importCsv(
    userId: string,
    buffer: Buffer,
  ): Promise<ImportCsvResponseDto> {
    this.logger.info('Starting CSV import');

    let records: any[];

    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      this.logger.debug('CSV parsed', { rows: records.length });
    } catch (err) {
      this.logger.error('CSV parsing failed', err as Error);
      throw new BadRequestException({
        code: 'import.csv_invalid',
      });
    }

    if (!records.length) {
      throw new BadRequestException({
        code: 'import.csv_empty',
      });
    }

    const requiredColumns = ['date', 'description', 'amount'];
    const actualColumns = Object.keys(records[0]);

    for (const col of requiredColumns) {
      if (!actualColumns.includes(col)) {
        throw new BadRequestException({
          code: 'import.csv_missing_column',
          meta: { column: col },
        });
      }
    }

    const rowsToInsert = records.map((row, index) => {
      const rowNumber = index + 2;

      const date = parseDate(row.date);
      if (!date) {
        throw new BadRequestException({
          code: 'import.invalid_date',
          meta: { row: rowNumber },
        });
      }

      const amount = Number(row.amount);
      if (Number.isNaN(amount)) {
        throw new BadRequestException({
          code: 'import.invalid_amount',
          meta: { row: rowNumber },
        });
      }

      const result = CsvRowSchema.safeParse({
        date,
        description: row.description,
        amount,
      });

      if (!result.success) {
        throw new BadRequestException({
          code: 'import.row_validation_failed',
          meta: { row: rowNumber },
        });
      }

      return result.data;
    });

    this.logger.info('CSV validation passed', {
      rows: rowsToInsert.length,
    });

    // ✅ Create import + rows in ONE transaction
    const importEntity = await this.prisma.transactionImport.create({
      data: {
        // userId should come from auth later
        userId,
        rows: {
          createMany: {
            data: rowsToInsert.map((row) => ({
              date: row.date,
              description: row.description,
              amount: row.amount,
            })),
          },
        },
      },
    });

    this.logger.info('CSV import created', {
      importId: importEntity.id,
    });

    return { importId: importEntity.id };
  }
}
