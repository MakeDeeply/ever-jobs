import { Module } from '@nestjs/common';
import { ConstanceHotelsResortsService } from './constancehotelsresorts.service';

@Module({ providers: [ConstanceHotelsResortsService], exports: [ConstanceHotelsResortsService] })
export class ConstanceHotelsResortsModule {}
