import { Module } from '@nestjs/common';
import { SyncereService } from './syncere.service';

@Module({
  providers: [SyncereService],
  exports: [SyncereService],
})
export class SyncereModule {}
