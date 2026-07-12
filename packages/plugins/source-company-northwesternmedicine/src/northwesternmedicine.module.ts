import { Module } from '@nestjs/common';
import { NorthwesternMedicineService } from './northwesternmedicine.service';

@Module({ providers: [NorthwesternMedicineService], exports: [NorthwesternMedicineService] })
export class NorthwesternMedicineModule {}
