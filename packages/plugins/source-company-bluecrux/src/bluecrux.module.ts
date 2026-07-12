import { Module } from '@nestjs/common';
import { BluecruxService } from './bluecrux.service';

@Module({ providers: [BluecruxService], exports: [BluecruxService] })
export class BluecruxModule {}
