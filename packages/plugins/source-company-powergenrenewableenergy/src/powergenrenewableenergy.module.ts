import { Module } from '@nestjs/common';
import { PowerGenRenewableEnergyService } from './powergenrenewableenergy.service';

@Module({ providers: [PowerGenRenewableEnergyService], exports: [PowerGenRenewableEnergyService] })
export class PowerGenRenewableEnergyModule {}
