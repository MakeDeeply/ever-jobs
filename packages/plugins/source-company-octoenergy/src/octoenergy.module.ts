import { Module } from '@nestjs/common';
import { OctopusEnergyGroupService } from './octoenergy.service';

@Module({ providers: [OctopusEnergyGroupService], exports: [OctopusEnergyGroupService] })
export class OctopusEnergyGroupModule {}
