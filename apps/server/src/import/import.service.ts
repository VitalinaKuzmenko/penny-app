// src/import/import.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowSchema } from 'schemas';
import { CsvRowDto } from 'schemas-nest';

import { WinstonLogger } from '../utils/logger/logger';
import { parseDate } from '../utils/parse-date';

@Injectable()
export class ImportService {
  constructor(private readonly logger: WinstonLogger) {}

  parseCsv(buffer: Buffer): CsvRowDto[] {
    this.logger.info('Starting CSV parsing');

    let records: any[];

    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      this.logger.debug(
        `CSV parsed successfully, ${records.length} rows found`,
      );
    } catch (err) {
      const errorMessage = (err as Error).message;
      this.logger.error('CSV parsing failed', errorMessage);
      throw new BadRequestException({
        code: 'import.csv_invalid',
      });
    }

    if (!records.length) {
      this.logger.warn('CSV file is empty');
      throw new BadRequestException({
        code: 'import.csv_empty',
      });
    }

    const requiredColumns = ['date', 'description', 'amount'];
    const actualColumns = Object.keys(records[0]);
    this.logger.debug('Checking required CSV columns', { actualColumns });

    for (const col of requiredColumns) {
      if (!actualColumns.includes(col)) {
        this.logger.warn(`Missing required column: ${col}`);
        throw new BadRequestException({
          code: 'import.csv_missing_column',
          meta: { column: col },
        });
      }
    }

    const parsedRows: CsvRowDto[] = [];

    records.forEach((row, index) => {
      const rowNumber = index + 2; // CSV header is row 1

      this.logger.debug(`Parsing row ${rowNumber}`, { row });

      // Parse date
      const date = parseDate(row.date);
      if (!date) {
        this.logger.warn(`Invalid date at row ${rowNumber}`, {
          value: row.date,
        });
        throw new BadRequestException({
          code: 'import.invalid_date',
          meta: { row: rowNumber },
        });
      }

      // Parse amount
      const amount = Number(row.amount);
      if (Number.isNaN(amount)) {
        this.logger.warn(`Invalid amount at row ${rowNumber}`, {
          value: row.amount,
        });
        throw new BadRequestException({
          code: 'import.invalid_amount',
          meta: { row: rowNumber },
        });
      }

      // Validate full row with Zod
      const result = CsvRowSchema.safeParse({
        date: date,
        description: row.description,
        amount,
      });

      if (!result.success) {
        this.logger.warn(`Row validation failed at row ${rowNumber}`, {
          errors: result.error.flatten(),
        });
        throw new BadRequestException({
          code: 'import.row_validation_failed',
          meta: { row: rowNumber },
        });
      }

      parsedRows.push(result.data);
    });

    this.logger.info('CSV parsing completed successfully', {
      totalRows: parsedRows.length,
    });
    return parsedRows;
  }
}
