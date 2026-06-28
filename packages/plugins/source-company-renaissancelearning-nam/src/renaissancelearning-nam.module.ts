import { Module } from '@nestjs/common';
import { RenaissanceLearningService } from './renaissancelearning-nam.service';

@Module({ providers: [RenaissanceLearningService], exports: [RenaissanceLearningService] })
export class RenaissanceLearningModule {}
