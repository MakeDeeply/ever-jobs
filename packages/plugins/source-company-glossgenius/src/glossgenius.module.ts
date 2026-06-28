import { Module } from '@nestjs/common';
import { GlossGeniusService } from './glossgenius.service';

@Module({ providers: [GlossGeniusService], exports: [GlossGeniusService] })
export class GlossGeniusModule {}
