import { Module } from '@nestjs/common';
import { AnchorageDigitalService } from './anchorage.service';

@Module({ providers: [AnchorageDigitalService], exports: [AnchorageDigitalService] })
export class AnchorageDigitalModule {}
