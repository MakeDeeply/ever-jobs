import { Module } from '@nestjs/common';
import { StratasFoodsService } from './stratasfoods.service';

@Module({ providers: [StratasFoodsService], exports: [StratasFoodsService] })
export class StratasFoodsModule {}
