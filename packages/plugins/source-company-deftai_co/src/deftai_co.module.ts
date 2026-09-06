import { Module } from '@nestjs/common';
import { DeftaiCoService } from './deftai_co.service';

@Module({
  providers: [DeftaiCoService],
  exports: [DeftaiCoService],
})
export class DeftaiCoModule {}
