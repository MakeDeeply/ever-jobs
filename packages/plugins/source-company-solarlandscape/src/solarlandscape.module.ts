import { Module } from '@nestjs/common';
import { SolarLandscapeService } from './solarlandscape.service';

@Module({ providers: [SolarLandscapeService], exports: [SolarLandscapeService] })
export class SolarLandscapeModule {}
