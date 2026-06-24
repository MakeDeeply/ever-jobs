import { Module } from '@nestjs/common';
import { EikonTherapeuticsService } from './eikontherapeutics.service';

@Module({ providers: [EikonTherapeuticsService], exports: [EikonTherapeuticsService] })
export class EikonTherapeuticsModule {}
