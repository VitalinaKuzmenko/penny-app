import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CsvRowDto } from 'schemas-nest';

import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Upload CSV and parse transactions' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: CsvRowDto,
    isArray: true,
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadCsv(@UploadedFile() file: Express.Multer.File): CsvRowDto[] {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.mimetype.includes('csv')) {
      throw new BadRequestException('Only CSV files are allowed');
    }

    const rows = this.importService.parseCsv(file.buffer);

    return rows;
  }
}
