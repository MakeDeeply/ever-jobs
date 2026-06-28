import { Module } from '@nestjs/common';
import { AkayshaEnergyService } from './akayshaenergy.service';

@Module({ providers: [AkayshaEnergyService], exports: [AkayshaEnergyService] })
export class AkayshaEnergyModule {}
