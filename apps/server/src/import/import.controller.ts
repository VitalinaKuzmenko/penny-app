import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CsvRowDto, CsvUploadDto } from 'schemas-nest';

import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Upload CSV and parse transactions' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file',
    type: CsvUploadDto,
  })
  @ApiOkResponse({
    type: CsvRowDto,
    isArray: true,
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadCsv(@UploadedFile() file: Express.Multer.File): CsvRowDto[] {
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

    return this.importService.parseCsv(file.buffer);
  }
}
