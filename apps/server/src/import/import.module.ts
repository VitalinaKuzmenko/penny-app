import { Module } from '@nestjs/common';

import { TagsModule } from '../tags/tags.module';

import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({
  imports: [TagsModule],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
