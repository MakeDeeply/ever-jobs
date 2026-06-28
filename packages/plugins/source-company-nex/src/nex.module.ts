import { Module } from '@nestjs/common';
import { NexService } from './nex.service';

@Module({ providers: [NexService], exports: [NexService] })
export class NexModule {}
