import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  ConfirmImportDto,
  ConfirmImportResponseDto,
  CsvImportResponseDTO,
  CsvUploadDto,
  ImportCsvResponseDto,
} from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WinstonLogger } from '../utils/logger/logger';

import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly logger: WinstonLogger,
  ) {}

  @Post('csv')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload CSV and create import draft' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file',
    type: CsvUploadDto,
  })
  @ApiOkResponse({
    type: ImportCsvResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadCsv(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportCsvResponseDto> {
    if (!file) {
      this.logger.warn('uploadCsv failed: file not found');
      throw new BadRequestException({
        code: 'import.file_required',
      });
    }

    if (!file.mimetype.includes('csv')) {
      this.logger.warn('uploadCsv failed: file not CSV', {
        mimetype: file.mimetype,
      });
      throw new BadRequestException({
        code: 'import.file_not_csv',
      });
    }
    const userId = req.user.userId;

    return this.importService.importCsv(userId, file.buffer);
  }

  @Get(':importId/rows')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all rows for an import' })
  @ApiParam({ name: 'importId', type: 'string' })
  @ApiOkResponse({ type: CsvImportResponseDTO, isArray: true })
  async getImportRows(
    @Param('importId') importId: string,
    @Req() req,
  ): Promise<CsvImportResponseDTO[]> {
    const userId = req.user.userId;

    const rows = await this.importService.getImportRows(userId, importId);

    if (!rows) {
      this.logger.warn('getImportRows failed: import not found', { importId });
      throw new NotFoundException({
        code: 'import.not_found',
      });
    }

    return rows;
  }

  @Post(':importId/confirm')
  @ApiOperation({ summary: 'Confirm imported CSV rows' })
  @ApiBody({ type: ConfirmImportDto })
  @ApiOkResponse({ type: ConfirmImportResponseDto })
  @UseGuards(JwtAuthGuard)
  async confirmImport(
    @Param('importId') importId: string,
    @Body() dto: ConfirmImportDto,
    @Req() req,
  ) {
    const userId = req.user.userId;

    await this.importService.confirmImport(userId, importId, dto);

    return { success: true };
  }

  /**
   * GET /import/direct-import
   * for data migration from excel to DB
   */
  @ApiOperation({ summary: 'Direct Import' })
  @Get('direct-import')
  @UseGuards(JwtAuthGuard)
  async directImport(@Req() req) {
    const userId = req.user.userId;

    const result = await this.importService.importCsvDirect(userId);

    return result; // { imported: 10 }
  }
}
