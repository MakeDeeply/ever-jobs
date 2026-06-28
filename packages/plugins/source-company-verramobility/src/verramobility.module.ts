import { Module } from '@nestjs/common';
import { VerraMobilityService } from './verramobility.service';

@Module({ providers: [VerraMobilityService], exports: [VerraMobilityService] })
export class VerraMobilityModule {}
