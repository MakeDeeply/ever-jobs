import { Module } from '@nestjs/common';
import { NMCHealthcareService } from './nmchealthcare.service';

@Module({ providers: [NMCHealthcareService], exports: [NMCHealthcareService] })
export class NMCHealthcareModule {}
