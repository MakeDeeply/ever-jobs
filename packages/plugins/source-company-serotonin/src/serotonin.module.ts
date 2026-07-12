import { Module } from '@nestjs/common';
import { SerotoninService } from './serotonin.service';

@Module({ providers: [SerotoninService], exports: [SerotoninService] })
export class SerotoninModule {}
