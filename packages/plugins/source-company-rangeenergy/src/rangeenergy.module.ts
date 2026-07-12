import { Module } from '@nestjs/common';
import { RangeEnergyService } from './rangeenergy.service';

@Module({ providers: [RangeEnergyService], exports: [RangeEnergyService] })
export class RangeEnergyModule {}
