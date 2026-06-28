import { Module } from '@nestjs/common';
import { InChargeEnergyService } from './inchargeenergy.service';

@Module({ providers: [InChargeEnergyService], exports: [InChargeEnergyService] })
export class InChargeEnergyModule {}
