import { Module } from '@nestjs/common';
import { KorsailEnergyService } from './korsailenergy.service';

@Module({ providers: [KorsailEnergyService], exports: [KorsailEnergyService] })
export class KorsailEnergyModule {}
