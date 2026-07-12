import { Module } from '@nestjs/common';
import { DopplerService } from './doppler.service';

@Module({ providers: [DopplerService], exports: [DopplerService] })
export class DopplerModule {}
