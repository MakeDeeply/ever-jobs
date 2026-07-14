import { Module } from '@nestjs/common';
import { PericomSemiconductorService } from './pericomsemiconductor.service';

@Module({ providers: [PericomSemiconductorService], exports: [PericomSemiconductorService] })
export class PericomSemiconductorModule {}
