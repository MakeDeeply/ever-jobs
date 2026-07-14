import { Module } from '@nestjs/common';
import { NPowerMedicineService } from './npowermedicine.service';

@Module({ providers: [NPowerMedicineService], exports: [NPowerMedicineService] })
export class NPowerMedicineModule {}
