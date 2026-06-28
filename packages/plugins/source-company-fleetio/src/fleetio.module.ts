import { Module } from '@nestjs/common';
import { FleetioService } from './fleetio.service';

@Module({ providers: [FleetioService], exports: [FleetioService] })
export class FleetioModule {}
