import { Module } from '@nestjs/common';
import { EquipHealthService } from './equiphealth.service';

@Module({ providers: [EquipHealthService], exports: [EquipHealthService] })
export class EquipHealthModule {}
