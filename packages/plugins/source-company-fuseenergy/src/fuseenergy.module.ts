import { Module } from '@nestjs/common';
import { FuseEnergyService } from './fuseenergy.service';

@Module({ providers: [FuseEnergyService], exports: [FuseEnergyService] })
export class FuseEnergyModule {}
