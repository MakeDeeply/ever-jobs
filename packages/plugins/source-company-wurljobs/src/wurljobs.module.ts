import { Module } from '@nestjs/common';
import { WurlService } from './wurljobs.service';

@Module({ providers: [WurlService], exports: [WurlService] })
export class WurlModule {}
