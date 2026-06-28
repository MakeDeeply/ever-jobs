import { Module } from '@nestjs/common';
import { PrimeMedicineService } from './primemedicine.service';

@Module({ providers: [PrimeMedicineService], exports: [PrimeMedicineService] })
export class PrimeMedicineModule {}
