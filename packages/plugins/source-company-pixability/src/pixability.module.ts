import { Module } from '@nestjs/common';
import { PixabilityService } from './pixability.service';

@Module({ providers: [PixabilityService], exports: [PixabilityService] })
export class PixabilityModule {}
