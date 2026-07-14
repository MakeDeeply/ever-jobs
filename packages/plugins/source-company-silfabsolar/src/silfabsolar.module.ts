import { Module } from '@nestjs/common';
import { SilfabSolarService } from './silfabsolar.service';

@Module({ providers: [SilfabSolarService], exports: [SilfabSolarService] })
export class SilfabSolarModule {}
