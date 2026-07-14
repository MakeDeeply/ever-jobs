import { Module } from '@nestjs/common';
import { OverviewEnergyService } from './overviewenergy.service';

@Module({ providers: [OverviewEnergyService], exports: [OverviewEnergyService] })
export class OverviewEnergyModule {}
