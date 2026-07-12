import { Module } from '@nestjs/common';
import { TwelveService } from './twelve.service';

@Module({ providers: [TwelveService], exports: [TwelveService] })
export class TwelveModule {}
