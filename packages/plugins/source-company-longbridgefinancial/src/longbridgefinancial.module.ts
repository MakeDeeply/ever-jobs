import { Module } from '@nestjs/common';
import { LongbridgeFinancialService } from './longbridgefinancial.service';

@Module({ providers: [LongbridgeFinancialService], exports: [LongbridgeFinancialService] })
export class LongbridgeFinancialModule {}
