import { Module } from '@nestjs/common';
import { MaticInsuranceService } from './matic.service';

@Module({ providers: [MaticInsuranceService], exports: [MaticInsuranceService] })
export class MaticInsuranceModule {}
