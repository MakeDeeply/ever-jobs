import { Module } from '@nestjs/common';
import { XcimerEnergyService } from './xcimer.service';

@Module({ providers: [XcimerEnergyService], exports: [XcimerEnergyService] })
export class XcimerEnergyModule {}
