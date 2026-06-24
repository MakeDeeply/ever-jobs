import { Module } from '@nestjs/common';
import { EtchedService } from './etchedai.service';

@Module({ providers: [EtchedService], exports: [EtchedService] })
export class EtchedModule {}
