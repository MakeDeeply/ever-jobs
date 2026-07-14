import { Module } from '@nestjs/common';
import { HealthcareSupportStaffingService } from './healthcaresupportstaffing.service';

@Module({ providers: [HealthcareSupportStaffingService], exports: [HealthcareSupportStaffingService] })
export class HealthcareSupportStaffingModule {}
