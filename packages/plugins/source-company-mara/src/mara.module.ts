import { Module } from '@nestjs/common';
import { MaraService } from './mara.service';

@Module({
  providers: [MaraService],
  exports: [MaraService],
})
export class MaraModule {}
