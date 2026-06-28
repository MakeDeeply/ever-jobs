import { Module } from '@nestjs/common';
import { OrigisEnergyService } from './origisenergy.service';

@Module({ providers: [OrigisEnergyService], exports: [OrigisEnergyService] })
export class OrigisEnergyModule {}
