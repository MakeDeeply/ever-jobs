import { Module } from '@nestjs/common';
import { EvidentService } from './evidentid.service';

@Module({ providers: [EvidentService], exports: [EvidentService] })
export class EvidentModule {}
