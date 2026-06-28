import { Module } from '@nestjs/common';
import { HeraldService } from './heraldapi.service';

@Module({ providers: [HeraldService], exports: [HeraldService] })
export class HeraldModule {}
