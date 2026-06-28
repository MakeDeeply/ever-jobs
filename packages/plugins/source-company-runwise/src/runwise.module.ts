import { Module } from '@nestjs/common';
import { RunwiseService } from './runwise.service';

@Module({ providers: [RunwiseService], exports: [RunwiseService] })
export class RunwiseModule {}
