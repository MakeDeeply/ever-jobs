import { Module } from '@nestjs/common';
import { SolarisService } from './solarisbank.service';

@Module({ providers: [SolarisService], exports: [SolarisService] })
export class SolarisModule {}
