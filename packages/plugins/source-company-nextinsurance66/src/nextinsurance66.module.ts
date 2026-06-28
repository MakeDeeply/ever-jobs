import { Module } from '@nestjs/common';
import { NextInsuranceService } from './nextinsurance66.service';

@Module({ providers: [NextInsuranceService], exports: [NextInsuranceService] })
export class NextInsuranceModule {}
