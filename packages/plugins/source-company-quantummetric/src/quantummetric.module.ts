import { Module } from '@nestjs/common';
import { QuantumMetricService } from './quantummetric.service';

@Module({ providers: [QuantumMetricService], exports: [QuantumMetricService] })
export class QuantumMetricModule {}
