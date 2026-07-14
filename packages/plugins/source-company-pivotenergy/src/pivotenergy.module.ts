import { Module } from '@nestjs/common';
import { PivotEnergyService } from './pivotenergy.service';

@Module({ providers: [PivotEnergyService], exports: [PivotEnergyService] })
export class PivotEnergyModule {}
