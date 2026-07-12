import { Module } from '@nestjs/common';
import { OffchainLabsService } from './offchainlabs.service';

@Module({ providers: [OffchainLabsService], exports: [OffchainLabsService] })
export class OffchainLabsModule {}
