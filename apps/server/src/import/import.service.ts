// src/import/import.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowSchema } from 'schemas';
import { CsvRowDto } from 'schemas-nest';

import { parseDate } from '../utils/parse-date';

@Injectable()
export class ImportService {
  parseCsv(buffer: Buffer): CsvRowDto[] {
    let records: any[];

    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
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

    return records.map((row, index) => {
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
        date: date,
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
  }
}
