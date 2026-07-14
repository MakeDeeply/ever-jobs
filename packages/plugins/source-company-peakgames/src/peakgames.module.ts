import { Module } from '@nestjs/common';
import { PeakService } from './peakgames.service';

@Module({ providers: [PeakService], exports: [PeakService] })
export class PeakModule {}
