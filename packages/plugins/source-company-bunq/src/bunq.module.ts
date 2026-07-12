import { Module } from '@nestjs/common';
import { BunqService } from './bunq.service';

@Module({ providers: [BunqService], exports: [BunqService] })
export class BunqModule {}
