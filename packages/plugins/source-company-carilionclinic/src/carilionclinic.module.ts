import { Module } from '@nestjs/common';
import { CarilionClinicService } from './carilionclinic.service';

@Module({ providers: [CarilionClinicService], exports: [CarilionClinicService] })
export class CarilionClinicModule {}
