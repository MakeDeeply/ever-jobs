import { Module } from '@nestjs/common';
import { StaffingMedicalUSAService } from './staffingmedicalusa.service';

@Module({ providers: [StaffingMedicalUSAService], exports: [StaffingMedicalUSAService] })
export class StaffingMedicalUSAModule {}
