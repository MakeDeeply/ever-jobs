import { Module } from '@nestjs/common';
import { WintermuteService } from './wintermutetrading.service';

@Module({ providers: [WintermuteService], exports: [WintermuteService] })
export class WintermuteModule {}
