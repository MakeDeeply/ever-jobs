import { Module } from '@nestjs/common';
import { RedBullService } from './redbull.service';

@Module({ providers: [RedBullService], exports: [RedBullService] })
export class RedBullModule {}
