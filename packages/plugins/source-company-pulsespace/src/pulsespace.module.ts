import { Module } from '@nestjs/common';
import { PulsespaceService } from './pulsespace.service';

@Module({
  providers: [PulsespaceService],
  exports: [PulsespaceService],
})
export class PulsespaceModule {}
