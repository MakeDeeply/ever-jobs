import { Module } from '@nestjs/common';
import { PenFinancialCreditUnionService } from './penfinancialcreditunion.service';

@Module({ providers: [PenFinancialCreditUnionService], exports: [PenFinancialCreditUnionService] })
export class PenFinancialCreditUnionModule {}
