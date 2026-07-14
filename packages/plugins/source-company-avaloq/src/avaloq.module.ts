import { Module } from '@nestjs/common';
import { AvaloqService } from './avaloq.service';

@Module({ providers: [AvaloqService], exports: [AvaloqService] })
export class AvaloqModule {}
