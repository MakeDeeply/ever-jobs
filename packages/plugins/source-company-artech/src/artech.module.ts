import { Module } from '@nestjs/common';
import { ArtechService } from './artech.service';

@Module({ providers: [ArtechService], exports: [ArtechService] })
export class ArtechModule {}
