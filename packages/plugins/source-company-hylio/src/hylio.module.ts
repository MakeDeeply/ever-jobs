import { Module } from '@nestjs/common';
import { HylioService } from './hylio.service';

@Module({
  providers: [HylioService],
  exports: [HylioService],
})
export class HylioModule {}
