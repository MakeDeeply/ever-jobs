import { Module } from '@nestjs/common';
import { GovTechSingaporeGovernmentTechnologyAgencyService } from './govtech.service';

@Module({ providers: [GovTechSingaporeGovernmentTechnologyAgencyService], exports: [GovTechSingaporeGovernmentTechnologyAgencyService] })
export class GovTechSingaporeGovernmentTechnologyAgencyModule {}
