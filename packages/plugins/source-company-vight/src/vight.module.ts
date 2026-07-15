import { Module } from '@nestjs/common';
import { VightService } from './vight.service';

@Module({
  providers: [VightService],
  exports: [VightService],
})
export class VightModule {}
