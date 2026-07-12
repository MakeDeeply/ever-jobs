import { Module } from '@nestjs/common';
import { PlatinumHealthcareStaffingService } from './platinumhealthcarestaffing.service';

@Module({ providers: [PlatinumHealthcareStaffingService], exports: [PlatinumHealthcareStaffingService] })
export class PlatinumHealthcareStaffingModule {}
