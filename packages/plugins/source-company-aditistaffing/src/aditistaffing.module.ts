import { Module } from '@nestjs/common';
import { AditiStaffingService } from './aditistaffing.service';

@Module({ providers: [AditiStaffingService], exports: [AditiStaffingService] })
export class AditiStaffingModule {}
