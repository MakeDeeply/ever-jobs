import { Module } from '@nestjs/common';
import { RedoxService } from './redoxengine.service';

@Module({ providers: [RedoxService], exports: [RedoxService] })
export class RedoxModule {}
