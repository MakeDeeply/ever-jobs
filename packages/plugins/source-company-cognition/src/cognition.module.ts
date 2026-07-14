import { Module } from '@nestjs/common';
import { CognitionService } from './cognition.service';

@Module({ providers: [CognitionService], exports: [CognitionService] })
export class CognitionModule {}
