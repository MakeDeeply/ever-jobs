import { Module } from '@nestjs/common';
import { CoinsPhService } from './coins.service';

@Module({ providers: [CoinsPhService], exports: [CoinsPhService] })
export class CoinsPhModule {}
