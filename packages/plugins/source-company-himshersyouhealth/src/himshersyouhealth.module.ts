import { Module } from '@nestjs/common';
import { HimsHersYouHealthService } from './himshersyouhealth.service';

@Module({ providers: [HimsHersYouHealthService], exports: [HimsHersYouHealthService] })
export class HimsHersYouHealthModule {}
