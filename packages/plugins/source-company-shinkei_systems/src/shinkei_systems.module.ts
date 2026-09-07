import { Module } from '@nestjs/common';
import { ShinkeiSystemsService } from './shinkei_systems.service';

@Module({
  providers: [ShinkeiSystemsService],
  exports: [ShinkeiSystemsService],
})
export class ShinkeiSystemsModule {}
