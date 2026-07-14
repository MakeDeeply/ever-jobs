import { Module } from '@nestjs/common';
import { EducativeService } from './educative.service';

@Module({ providers: [EducativeService], exports: [EducativeService] })
export class EducativeModule {}
