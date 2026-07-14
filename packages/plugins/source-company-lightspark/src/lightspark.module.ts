import { Module } from '@nestjs/common';
import { LightsparkService } from './lightspark.service';

@Module({ providers: [LightsparkService], exports: [LightsparkService] })
export class LightsparkModule {}
