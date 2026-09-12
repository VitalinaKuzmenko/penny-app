// src/import/import.service.ts
import fs from 'fs';
import path from 'path';

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { ConfirmImportInput, CsvRowSchema } from 'schemas';
import { CsvImportResponseDTO, ImportCsvResponseDto } from 'schemas-nest';

import {
  ImportStatus,
  TransactionType,
} from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { formatDateToString } from '../utils/formatDateToString';
import { WinstonLogger } from '../utils/logger/logger';
import { parseDate } from '../utils/parse-date';
import { buildTransactionFingerprint } from '../utils/transaction-fingerprint';

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
        columns: (headers: string[]) =>
          headers.map((h) =>
            h
              .replace(/^\uFEFF/, '') // remove BOM
              .trim()
              .toLowerCase(),
          ),
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
        this.logger.warn('Missing column', { column: col });
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
        this.logger.warn('Invalid date', { row });
        throw new BadRequestException({
          code: 'import.invalid_date',
          meta: { row: rowNumber },
        });
      }

      const amount = Number(row.amount);
      if (Number.isNaN(amount)) {
        this.logger.warn('Invalid amount', { row });
        throw new BadRequestException({
          code: 'import.invalid_amount',
          meta: { row: rowNumber },
        });
      }

      const result = CsvRowSchema.safeParse({
        date: formatDateToString(date), // Date object
        description: row.description,
        amount,
      });

      if (!result.success) {
        this.logger.warn('CSV row validation failed', result.error);
        throw new BadRequestException({
          code: 'import.row_validation_failed',
          meta: { row: rowNumber },
        });
      }

      return result.data; // { date: Date, description, amount }
    });

    this.logger.info('CSV validation passed', {
      rows: rowsToInsert.length,
    });

    // ✅ Create import + rows in ONE transaction
    const importEntity = await this.prisma.transactionImport.create({
      data: {
        userId,
        rows: {
          createMany: {
            data: rowsToInsert.map((row) => ({
              date: parseDate(row.date),
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

  async getImportRows(
    userId: string,
    importId: string,
    accountId?: string,
  ): Promise<CsvImportResponseDTO[] | null> {
    this.logger.info('Getting import rows', { importId, userId });
    const importEntity = await this.prisma.transactionImport.findFirst({
      where: { id: importId, userId },
      include: { rows: { orderBy: { date: 'asc' } } },
    });

    if (!importEntity) {
      this.logger.info('Import not found', { importId, userId });
      return null;
    }

    // Bulk-fetch all mappings for this user keyed by normalised description
    const normalisedDescriptions = importEntity.rows.map((r) =>
      r.description.trim().toLowerCase(),
    );
    const mappings = await this.prisma.categoryMapping.findMany({
      where: { userId, description: { in: normalisedDescriptions } },
      select: { description: true, categoryId: true },
    });
    const mappingMap = new Map(
      mappings.map((m) => [m.description, m.categoryId]),
    );

    // Only known once an account is chosen, since dedupe is scoped per account.
    // Keep every match (not just a count) so genuinely repeated transactions
    // (e.g. two identical coffees on the same day) aren't all flagged, and so
    // we can show the user exactly which existing transaction each row matched.
    const existingByFingerprint = new Map<
      string,
      { date: Date; description: string | null; amount: number }[]
    >();
    if (accountId) {
      const existing = await this.prisma.transaction.findMany({
        where: { accountId, userId, fingerprint: { not: null } },
        select: {
          fingerprint: true,
          date: true,
          description: true,
          amount: true,
          type: true,
        },
      });
      for (const t of existing) {
        const fp = t.fingerprint as string;
        const list = existingByFingerprint.get(fp) ?? [];
        list.push({
          date: t.date,
          description: t.description,
          amount:
            t.type === TransactionType.EXPENSE
              ? -Number(t.amount)
              : Number(t.amount),
        });
        existingByFingerprint.set(fp, list);
      }
    }

    this.logger.info('Import found', {
      importId: importEntity.id,
      rows: importEntity.rows.length,
      mappedRows: mappingMap.size,
    });

    const consumedInPreview = new Map<string, number>();

    return importEntity.rows.map((row) => {
      const key = row.description.trim().toLowerCase();
      const suggestedCategoryId = mappingMap.get(key) ?? null;
      const fingerprint = buildTransactionFingerprint(
        row.date,
        Number(row.amount),
        row.description,
      );
      const matches = existingByFingerprint.get(fingerprint) ?? [];
      const alreadyConsumed = consumedInPreview.get(fingerprint) ?? 0;
      const match = matches[alreadyConsumed] ?? null;
      consumedInPreview.set(fingerprint, alreadyConsumed + 1);
      return {
        id: row.id,
        date: formatDateToString(row.date),
        description: row.description,
        amount: Number(row.amount),
        suggestedCategoryId,
        autoAssigned: suggestedCategoryId !== null,
        duplicate: match !== null,
        duplicateOf: match
          ? {
              date: formatDateToString(match.date),
              description: match.description ?? '',
              amount: match.amount,
            }
          : null,
      };
    });
  }

  async confirmImport(
    userId: string,
    importId: string,
    dto: ConfirmImportInput,
  ): Promise<{ skippedDuplicates: number }> {
    this.logger.info('Confirming import', { userId, importId });

    const importEntity = await this.prisma.transactionImport.findFirst({
      where: {
        id: importId,
        userId,
      },
      include: {
        rows: true,
      },
    });

    if (!importEntity) {
      this.logger.warn('Import not found', { importId, userId });
      throw new NotFoundException({
        code: 'import.not_found',
      });
    }

    if (importEntity.status === 'CONFIRMED') {
      this.logger.warn('Import already confirmed', { importId, userId });
      throw new BadRequestException({
        code: 'import.already_confirmed',
      });
    }

    const rowInputMap = new Map<string, ConfirmImportInput['rows'][number]>(
      dto.rows.map((row) => [row.id, row]),
    );

    const existing = await this.prisma.transaction.findMany({
      where: { accountId: dto.accountId, userId, fingerprint: { not: null } },
      select: { fingerprint: true },
    });
    const existingCounts = new Map<string, number>();
    for (const t of existing) {
      const fp = t.fingerprint as string;
      existingCounts.set(fp, (existingCounts.get(fp) ?? 0) + 1);
    }

    let skippedDuplicates = 0;
    // how many rows in this batch already matched an existing transaction,
    // so a 3rd identical row isn't wrongly skipped when only 2 already exist
    const consumedInBatch = new Map<string, number>();

    const rowsToInsert = importEntity.rows.flatMap((row) => {
      const input = rowInputMap.get(row.id);

      if (!input) {
        this.logger.warn('Missing input for row', { rowId: row.id });
        throw new BadRequestException({
          code: 'import.row_missing_input',
          meta: { rowId: row.id },
        });
      }

      const description = input.description ?? row.description;
      const fingerprint = buildTransactionFingerprint(
        row.date,
        Number(row.amount),
        description,
      );

      const alreadyConsumed = consumedInBatch.get(fingerprint) ?? 0;
      const isDuplicate =
        alreadyConsumed < (existingCounts.get(fingerprint) ?? 0);
      consumedInBatch.set(fingerprint, alreadyConsumed + 1);

      // the user saw the duplicate warning and explicitly chose to import anyway
      if (isDuplicate && !input.forceImport) {
        skippedDuplicates += 1;
        return [];
      }

      return [
        {
          userId,
          date: row.date,
          description,
          amount: Math.abs(Number(row.amount)),
          currency: dto.currency,
          accountId: dto.accountId,
          categoryId: input.categoryId ?? null,
          fingerprint,
          type:
            Number(row.amount) > 0
              ? TransactionType.INCOME
              : TransactionType.EXPENSE,
        },
      ];
    });

    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create real transactions, skipping any that already exist on this account
      if (rowsToInsert.length) {
        await tx.transaction.createMany({
          data: rowsToInsert,
        });
      }

      // 2️⃣ Upsert category mappings for every row that has a categoryId
      const mappingsToUpsert = importEntity.rows
        .map((row) => {
          const input = rowInputMap.get(row.id);
          const categoryId = input?.categoryId;
          if (!categoryId) return null;
          return {
            description: (input?.description ?? row.description)
              .trim()
              .toLowerCase(),
            categoryId,
          };
        })
        .filter(
          (m): m is { description: string; categoryId: string } => m !== null,
        );

      for (const mapping of mappingsToUpsert) {
        await tx.categoryMapping.upsert({
          where: {
            userId_description: { userId, description: mapping.description },
          },
          create: {
            userId,
            description: mapping.description,
            categoryId: mapping.categoryId,
          },
          update: { categoryId: mapping.categoryId },
        });
      }

      // 3️⃣ Mark import as confirmed
      await tx.transactionImport.update({
        where: { id: importId },
        data: { status: ImportStatus.CONFIRMED },
      });
    });

    this.logger.info('Import confirmed successfully', {
      importId,
      userId,
      skippedDuplicates,
    });

    return { skippedDuplicates };
  }

  //for data migration from excel to DB
  /**
   * Custom CSV import directly into Transaction table
   * Uses default CSV file 'cleaned_transactions.csv' in the same folder
   */
  async importCsvDirect(userId: string) {
    this.logger.info('Importing CSV', { userId });
    const filePath = path.resolve(__dirname, 'cleaned_transactions.csv');

    if (!fs.existsSync(filePath)) {
      this.logger.warn('CSV file not found');
      throw new BadRequestException({ code: 'import.file_not_found' });
    }

    const buffer = fs.readFileSync(filePath);

    let records: any[];
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err: any) {
      this.logger.error('Error parsing CSV:', err, err.message);
      throw new BadRequestException({ code: 'import.csv_invalid' });
    }

    if (!records.length) {
      this.logger.warn('CSV is empty');
      throw new BadRequestException({ code: 'import.csv_empty' });
    }

    // Validate required columns
    const requiredColumns = [
      'date',
      'description',
      'amount',
      'currency',
      'type',
      'userId',
      'categoryId',
      'accountId',
    ];
    const missing = requiredColumns.filter(
      (col) => !Object.keys(records[0]).includes(col),
    );
    if (missing.length) {
      this.logger.warn('Missing required columns:', missing);
      throw new BadRequestException({
        code: 'import.missing_columns',
        meta: { missing },
      });
    }

    // Prepare transactions
    const transactions = records.map((row) => ({
      userId,
      date: parseDate(row.date) ?? new Date(row.date),
      description: row.description?.trim() || 'No description',
      amount: parseFloat(row.amount),
      currency: row.currency,
      type: row.type,
      categoryId: row.categoryId,
      accountId: row.accountId,
    }));

    // Insert into DB
    await this.prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });

    return { imported: transactions.length };
  }
}
