import { Module } from '@nestjs/common';
import { UnitekLearningService } from './uniteklearning.service';

@Module({ providers: [UnitekLearningService], exports: [UnitekLearningService] })
export class UnitekLearningModule {}
