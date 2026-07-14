import { Module } from '@nestjs/common';
import { StaxxerService } from './staxxer.service';

@Module({ providers: [StaxxerService], exports: [StaxxerService] })
export class StaxxerModule {}
