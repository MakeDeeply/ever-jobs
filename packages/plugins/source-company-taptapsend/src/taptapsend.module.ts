import { Module } from '@nestjs/common';
import { TaptapSendService } from './taptapsend.service';

@Module({ providers: [TaptapSendService], exports: [TaptapSendService] })
export class TaptapSendModule {}
