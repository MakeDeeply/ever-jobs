import { Module } from '@nestjs/common';
import { StudyPointService } from './studypoint.service';

@Module({ providers: [StudyPointService], exports: [StudyPointService] })
export class StudyPointModule {}
