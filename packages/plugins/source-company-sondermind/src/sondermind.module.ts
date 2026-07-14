import { Module } from '@nestjs/common';
import { SonderMindService } from './sondermind.service';

@Module({ providers: [SonderMindService], exports: [SonderMindService] })
export class SonderMindModule {}
