import { Module } from '@nestjs/common';
import { PilotCompanyService } from './pilotcompany.service';

@Module({ providers: [PilotCompanyService], exports: [PilotCompanyService] })
export class PilotCompanyModule {}
