import { Module } from '@nestjs/common';
import { EtihadAirwaysService } from './etihadairways.service';

@Module({ providers: [EtihadAirwaysService], exports: [EtihadAirwaysService] })
export class EtihadAirwaysModule {}
