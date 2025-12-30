import { ApiProperty } from '@nestjs/swagger';

export class CsvUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: any;
}
