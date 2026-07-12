import { Module } from '@nestjs/common';
import { DeltaElectronicsService } from './deltaelectronics.service';

@Module({ providers: [DeltaElectronicsService], exports: [DeltaElectronicsService] })
export class DeltaElectronicsModule {}
