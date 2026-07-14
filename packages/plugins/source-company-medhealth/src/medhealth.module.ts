import { Module } from '@nestjs/common';
import { MedHealthService } from './medhealth.service';

@Module({ providers: [MedHealthService], exports: [MedHealthService] })
export class MedHealthModule {}
