import { Module } from '@nestjs/common';
import { ViralNationService } from './viralnation.service';

@Module({ providers: [ViralNationService], exports: [ViralNationService] })
export class ViralNationModule {}
