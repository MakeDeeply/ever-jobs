import { Module } from '@nestjs/common';
import { TeleoService } from './teleo.service';

@Module({ providers: [TeleoService], exports: [TeleoService] })
export class TeleoModule {}
