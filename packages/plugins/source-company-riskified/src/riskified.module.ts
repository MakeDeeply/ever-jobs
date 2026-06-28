import { Module } from '@nestjs/common';
import { RiskifiedService } from './riskified.service';

@Module({ providers: [RiskifiedService], exports: [RiskifiedService] })
export class RiskifiedModule {}
