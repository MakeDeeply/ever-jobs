import { Module } from '@nestjs/common';
import { NewLeafEnergyService } from './newleafenergy.service';

@Module({ providers: [NewLeafEnergyService], exports: [NewLeafEnergyService] })
export class NewLeafEnergyModule {}
