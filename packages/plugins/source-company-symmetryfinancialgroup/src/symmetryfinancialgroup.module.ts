import { Module } from '@nestjs/common';
import { SymmetryFinancialGroupService } from './symmetryfinancialgroup.service';

@Module({ providers: [SymmetryFinancialGroupService], exports: [SymmetryFinancialGroupService] })
export class SymmetryFinancialGroupModule {}
