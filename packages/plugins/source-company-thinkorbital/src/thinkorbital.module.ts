import { Module } from '@nestjs/common';
import { ThinkorbitalService } from './thinkorbital.service';

@Module({
  providers: [ThinkorbitalService],
  exports: [ThinkorbitalService],
})
export class ThinkorbitalModule {}
