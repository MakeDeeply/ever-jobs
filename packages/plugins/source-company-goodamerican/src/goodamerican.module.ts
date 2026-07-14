import { Module } from '@nestjs/common';
import { GoodAmericanService } from './goodamerican.service';

@Module({ providers: [GoodAmericanService], exports: [GoodAmericanService] })
export class GoodAmericanModule {}
