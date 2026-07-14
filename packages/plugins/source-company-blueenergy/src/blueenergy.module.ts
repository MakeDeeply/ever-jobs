import { Module } from '@nestjs/common';
import { BlueEnergyService } from './blueenergy.service';

@Module({ providers: [BlueEnergyService], exports: [BlueEnergyService] })
export class BlueEnergyModule {}
