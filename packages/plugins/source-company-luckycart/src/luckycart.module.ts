import { Module } from '@nestjs/common';
import { LuckyCartService } from './luckycart.service';

@Module({ providers: [LuckyCartService], exports: [LuckyCartService] })
export class LuckyCartModule {}
