import { Module } from '@nestjs/common';
import { ValeoFoodsService } from './valeofoods.service';

@Module({ providers: [ValeoFoodsService], exports: [ValeoFoodsService] })
export class ValeoFoodsModule {}
