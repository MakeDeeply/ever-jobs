import { Module } from '@nestjs/common';
import { HaltonHealthcareService } from './haltonhealthcare.service';

@Module({ providers: [HaltonHealthcareService], exports: [HaltonHealthcareService] })
export class HaltonHealthcareModule {}
