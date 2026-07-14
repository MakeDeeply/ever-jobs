import { Module } from '@nestjs/common';
import { SimplisolarService } from './simplisolar.service';

@Module({ providers: [SimplisolarService], exports: [SimplisolarService] })
export class SimplisolarModule {}
