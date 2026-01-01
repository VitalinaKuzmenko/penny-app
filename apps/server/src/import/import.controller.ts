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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CsvRowDto, CsvUploadDto, ImportCsvResponseDto } from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

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
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportCsvResponseDto> {
    if (!file) {
      throw new BadRequestException({
        code: 'import.file_required',
      });
    }

    if (!file.mimetype.includes('csv')) {
      throw new BadRequestException({
        code: 'import.file_not_csv',
      });
    }
    const userId = req.user.userId;

    if (!userId) {
      throw new UnauthorizedException({
        code: 'auth.unauthorized',
      });
    }

    return this.importService.importCsv(userId, file.buffer);
  }

  @Get(':importId/rows')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all rows for an import' })
  @ApiParam({ name: 'importId', type: 'string' })
  @ApiOkResponse({ type: CsvRowDto, isArray: true })
  async getImportRows(
    @Param('importId') importId: string,
    @Req() req,
  ): Promise<CsvRowDto[]> {
    const userId = req.user.userId;

    if (!userId) {
      throw new UnauthorizedException({
        code: 'auth.unauthorized',
      });
    }

    const rows = await this.importService.getImportRows(userId, importId);

    if (!rows) {
      throw new NotFoundException({
        code: 'import.not_found',
      });
    }

    return rows;
  }
}
