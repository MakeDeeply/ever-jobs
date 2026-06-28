import { Module } from '@nestjs/common';
import { StrandTherapeuticsService } from './strandtherapeutics.service';

@Module({ providers: [StrandTherapeuticsService], exports: [StrandTherapeuticsService] })
export class StrandTherapeuticsModule {}
