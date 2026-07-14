import { Module } from '@nestjs/common';
import { BlockstreamService } from './blockstream.service';

@Module({ providers: [BlockstreamService], exports: [BlockstreamService] })
export class BlockstreamModule {}
