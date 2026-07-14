import { Module } from '@nestjs/common';
import { HackerOneService } from './hackerone.service';

@Module({ providers: [HackerOneService], exports: [HackerOneService] })
export class HackerOneModule {}
