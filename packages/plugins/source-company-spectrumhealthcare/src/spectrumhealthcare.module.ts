import { Module } from '@nestjs/common';
import { SpectrumHealthCareService } from './spectrumhealthcare.service';

@Module({ providers: [SpectrumHealthCareService], exports: [SpectrumHealthCareService] })
export class SpectrumHealthCareModule {}
