import { Module } from '@nestjs/common';
import { GengalacticService } from './gengalactic.service';

@Module({
  providers: [GengalacticService],
  exports: [GengalacticService],
})
export class GengalacticModule {}
