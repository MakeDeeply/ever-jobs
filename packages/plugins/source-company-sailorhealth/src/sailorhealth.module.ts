import { Module } from '@nestjs/common';
import { SailorHealthService } from './sailorhealth.service';

@Module({ providers: [SailorHealthService], exports: [SailorHealthService] })
export class SailorHealthModule {}
