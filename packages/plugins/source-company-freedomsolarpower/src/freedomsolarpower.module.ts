import { Module } from '@nestjs/common';
import { FreedomSolarPowerService } from './freedomsolarpower.service';

@Module({ providers: [FreedomSolarPowerService], exports: [FreedomSolarPowerService] })
export class FreedomSolarPowerModule {}
