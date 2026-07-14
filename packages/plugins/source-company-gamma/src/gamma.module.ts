import { Module } from '@nestjs/common';
import { GammaService } from './gamma.service';

@Module({ providers: [GammaService], exports: [GammaService] })
export class GammaModule {}
