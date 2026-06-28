import { Module } from '@nestjs/common';
import { GotionService } from './gotion.service';

@Module({ providers: [GotionService], exports: [GotionService] })
export class GotionModule {}
