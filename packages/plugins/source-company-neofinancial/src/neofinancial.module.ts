import { Module } from '@nestjs/common';
import { NeoFinancialService } from './neofinancial.service';

@Module({ providers: [NeoFinancialService], exports: [NeoFinancialService] })
export class NeoFinancialModule {}
