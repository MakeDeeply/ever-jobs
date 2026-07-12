import { Module } from '@nestjs/common';
import { AxleEnergyService } from './axleenergy.service';

@Module({ providers: [AxleEnergyService], exports: [AxleEnergyService] })
export class AxleEnergyModule {}
