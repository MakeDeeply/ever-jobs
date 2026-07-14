import { Module } from '@nestjs/common';
import { LearnedService } from './learned.service';

@Module({ providers: [LearnedService], exports: [LearnedService] })
export class LearnedModule {}
