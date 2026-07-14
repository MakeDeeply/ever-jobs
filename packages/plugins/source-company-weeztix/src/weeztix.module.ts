import { Module } from '@nestjs/common';
import { WeeztixService } from './weeztix.service';

@Module({ providers: [WeeztixService], exports: [WeeztixService] })
export class WeeztixModule {}
