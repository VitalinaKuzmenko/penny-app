import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CsvUploadDto, ImportCsvResponseDto } from 'schemas-nest';

import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
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
    return this.importService.importCsv(userId, file.buffer);
  }
}
