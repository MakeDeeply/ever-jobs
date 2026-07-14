import { Module } from '@nestjs/common';
import { LimitBreakService } from './limitbreak.service';

@Module({ providers: [LimitBreakService], exports: [LimitBreakService] })
export class LimitBreakModule {}
