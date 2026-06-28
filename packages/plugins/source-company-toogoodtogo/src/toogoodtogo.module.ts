import { Module } from '@nestjs/common';
import { TooGoodToGoService } from './toogoodtogo.service';

@Module({ providers: [TooGoodToGoService], exports: [TooGoodToGoService] })
export class TooGoodToGoModule {}
