import { Module } from '@nestjs/common';
import { EnergyRecoveryService } from './energyrecovery.service';

@Module({ providers: [EnergyRecoveryService], exports: [EnergyRecoveryService] })
export class EnergyRecoveryModule {}
