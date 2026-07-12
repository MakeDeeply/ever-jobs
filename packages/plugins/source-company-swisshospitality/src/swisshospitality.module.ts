import { Module } from '@nestjs/common';
import { SwissHospitalityService } from './swisshospitality.service';

@Module({ providers: [SwissHospitalityService], exports: [SwissHospitalityService] })
export class SwissHospitalityModule {}
