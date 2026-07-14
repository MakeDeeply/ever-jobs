import { Module } from '@nestjs/common';
import { MATHoldingsService } from './matholdings.service';

@Module({ providers: [MATHoldingsService], exports: [MATHoldingsService] })
export class MATHoldingsModule {}
