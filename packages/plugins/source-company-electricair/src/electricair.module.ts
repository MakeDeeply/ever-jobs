import { Module } from '@nestjs/common';
import { ElectricAirService } from './electricair.service';

@Module({ providers: [ElectricAirService], exports: [ElectricAirService] })
export class ElectricAirModule {}
