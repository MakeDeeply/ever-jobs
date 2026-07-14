import { Module } from '@nestjs/common';
import { IncludedHealthService } from './includedhealth.service';

@Module({ providers: [IncludedHealthService], exports: [IncludedHealthService] })
export class IncludedHealthModule {}
