import { Module } from '@nestjs/common';
import { BlossomHealthService } from './blossomhealth.service';

@Module({ providers: [BlossomHealthService], exports: [BlossomHealthService] })
export class BlossomHealthModule {}
