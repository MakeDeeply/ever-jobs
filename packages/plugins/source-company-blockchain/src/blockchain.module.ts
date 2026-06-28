import { Module } from '@nestjs/common';
import { BlockchainComService } from './blockchain.service';

@Module({ providers: [BlockchainComService], exports: [BlockchainComService] })
export class BlockchainComModule {}
