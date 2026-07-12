import { Module } from '@nestjs/common';
import { GlassHealthService } from './glasshealthinc.service';

@Module({ providers: [GlassHealthService], exports: [GlassHealthService] })
export class GlassHealthModule {}
