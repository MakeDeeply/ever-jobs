import { Module } from '@nestjs/common';
import { FeedzaiService } from './feedzai.service';

@Module({ providers: [FeedzaiService], exports: [FeedzaiService] })
export class FeedzaiModule {}
