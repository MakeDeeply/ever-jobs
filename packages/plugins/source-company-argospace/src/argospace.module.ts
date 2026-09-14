import { Module } from '@nestjs/common';
import { ArgospaceService } from './argospace.service';

@Module({
  providers: [ArgospaceService],
  exports: [ArgospaceService],
})
export class ArgospaceModule {}
