import { Module } from '@nestjs/common';
import { StanfordMedicineChildrenSHealthService } from './stanfordmedicinechildrenshealth.service';

@Module({ providers: [StanfordMedicineChildrenSHealthService], exports: [StanfordMedicineChildrenSHealthService] })
export class StanfordMedicineChildrenSHealthModule {}
