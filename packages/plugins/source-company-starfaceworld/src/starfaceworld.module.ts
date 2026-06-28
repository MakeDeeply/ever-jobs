import { Module } from '@nestjs/common';
import { StarfaceWorldService } from './starfaceworld.service';

@Module({ providers: [StarfaceWorldService], exports: [StarfaceWorldService] })
export class StarfaceWorldModule {}
