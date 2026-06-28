import { Module } from '@nestjs/common';
import { SpotHopperService } from './spothopper.service';

@Module({ providers: [SpotHopperService], exports: [SpotHopperService] })
export class SpotHopperModule {}
