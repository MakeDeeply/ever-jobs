import { Module } from '@nestjs/common';
import { MintlifyService } from './mintlify.service';

@Module({ providers: [MintlifyService], exports: [MintlifyService] })
export class MintlifyModule {}
