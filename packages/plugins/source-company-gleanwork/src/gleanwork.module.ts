import { Module } from '@nestjs/common';
import { GleanService } from './gleanwork.service';

@Module({ providers: [GleanService], exports: [GleanService] })
export class GleanModule {}
