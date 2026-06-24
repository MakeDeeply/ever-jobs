import { Module } from '@nestjs/common';
import { GarnerHealthService } from './garnerhealth.service';

@Module({ providers: [GarnerHealthService], exports: [GarnerHealthService] })
export class GarnerHealthModule {}
