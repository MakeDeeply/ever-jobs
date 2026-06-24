import { Module } from '@nestjs/common';
import { PeakEnergyService } from './peakenergy.service';

@Module({ providers: [PeakEnergyService], exports: [PeakEnergyService] })
export class PeakEnergyModule {}
