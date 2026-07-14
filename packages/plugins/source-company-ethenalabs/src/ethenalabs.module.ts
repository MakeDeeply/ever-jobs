import { Module } from '@nestjs/common';
import { EthenaLabsService } from './ethenalabs.service';

@Module({ providers: [EthenaLabsService], exports: [EthenaLabsService] })
export class EthenaLabsModule {}
