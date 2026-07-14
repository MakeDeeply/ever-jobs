import { Module } from '@nestjs/common';
import { IncidentIoService } from './incidentio.service';

@Module({ providers: [IncidentIoService], exports: [IncidentIoService] })
export class IncidentIoModule {}
