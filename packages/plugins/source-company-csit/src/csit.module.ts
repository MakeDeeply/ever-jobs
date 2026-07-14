import { Module } from '@nestjs/common';
import { CentreForStrategicInfocommTechnologiesCSITService } from './csit.service';

@Module({ providers: [CentreForStrategicInfocommTechnologiesCSITService], exports: [CentreForStrategicInfocommTechnologiesCSITService] })
export class CentreForStrategicInfocommTechnologiesCSITModule {}
