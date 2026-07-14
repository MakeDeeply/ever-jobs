import { Module } from '@nestjs/common';
import { NexthinkService } from './nexthink.service';

@Module({ providers: [NexthinkService], exports: [NexthinkService] })
export class NexthinkModule {}
