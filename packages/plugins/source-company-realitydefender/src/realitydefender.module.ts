import { Module } from '@nestjs/common';
import { RealityDefenderService } from './realitydefender.service';

@Module({ providers: [RealityDefenderService], exports: [RealityDefenderService] })
export class RealityDefenderModule {}
