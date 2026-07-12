import { Module } from '@nestjs/common';
import { MintedService } from './minted.service';

@Module({ providers: [MintedService], exports: [MintedService] })
export class MintedModule {}
