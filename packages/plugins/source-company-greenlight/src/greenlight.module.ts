import { Module } from '@nestjs/common';
import { GreenlightFinancialTechnologyService } from './greenlight.service';

@Module({ providers: [GreenlightFinancialTechnologyService], exports: [GreenlightFinancialTechnologyService] })
export class GreenlightFinancialTechnologyModule {}
