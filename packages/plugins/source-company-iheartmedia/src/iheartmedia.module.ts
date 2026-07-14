import { Module } from '@nestjs/common';
import { IHeartMediaService } from './iheartmedia.service';

@Module({ providers: [IHeartMediaService], exports: [IHeartMediaService] })
export class IHeartMediaModule {}
