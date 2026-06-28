import { Module } from '@nestjs/common';
import { AuroraInnovationService } from './aurorainnovation.service';

@Module({ providers: [AuroraInnovationService], exports: [AuroraInnovationService] })
export class AuroraInnovationModule {}
