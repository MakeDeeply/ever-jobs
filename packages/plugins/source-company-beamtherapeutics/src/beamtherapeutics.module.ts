import { Module } from '@nestjs/common';
import { BeamTherapeuticsService } from './beamtherapeutics.service';

@Module({ providers: [BeamTherapeuticsService], exports: [BeamTherapeuticsService] })
export class BeamTherapeuticsModule {}
