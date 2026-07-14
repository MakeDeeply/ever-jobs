import { Module } from '@nestjs/common';
import { MainspringEnergyService } from './mainspringenergy.service';

@Module({ providers: [MainspringEnergyService], exports: [MainspringEnergyService] })
export class MainspringEnergyModule {}
