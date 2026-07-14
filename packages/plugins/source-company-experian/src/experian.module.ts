import { Module } from '@nestjs/common';
import { ExperianService } from './experian.service';

@Module({ providers: [ExperianService], exports: [ExperianService] })
export class ExperianModule {}
