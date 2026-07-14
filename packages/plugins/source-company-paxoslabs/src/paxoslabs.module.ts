import { Module } from '@nestjs/common';
import { PaxosLabsService } from './paxoslabs.service';

@Module({ providers: [PaxosLabsService], exports: [PaxosLabsService] })
export class PaxosLabsModule {}
