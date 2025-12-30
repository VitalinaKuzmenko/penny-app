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
      throw new BadRequestException('Invalid CSV file');
    }

    if (!records.length) {
      throw new BadRequestException('CSV file is empty');
    }

    // Validate column names
    const requiredColumns = ['date', 'description', 'amount'];
    const actualColumns = Object.keys(records[0]);

    for (const col of requiredColumns) {
      if (!actualColumns.includes(col)) {
        throw new BadRequestException(`Missing required column: ${col}`);
      }
    }

    // Normalize + validate rows
    return records.map((row, index) => {
      const date = parseDate(row.date);
      if (!date) {
        throw new BadRequestException(
          `Invalid date format at row ${index + 2}`,
        );
      }

      const amount = Number(row.amount);
      if (Number.isNaN(amount)) {
        throw new BadRequestException(`Invalid amount at row ${index + 2}`);
      }

      const result = CsvRowSchema.safeParse({
        date,
        description: row.description,
        amount,
      });

      if (!result.success) {
        throw new BadRequestException({
          row: index + 2,
          errors: result.error.flatten(),
        });
      }

      return result.data;
    });
  }
}
