import { Module } from '@nestjs/common';
import { MethodFinancialService } from './methodfinancial.service';

@Module({ providers: [MethodFinancialService], exports: [MethodFinancialService] })
export class MethodFinancialModule {}
