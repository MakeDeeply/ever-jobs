import { Module } from '@nestjs/common';
import { ArborEnergyService } from './arborenergy.service';

@Module({ providers: [ArborEnergyService], exports: [ArborEnergyService] })
export class ArborEnergyModule {}
