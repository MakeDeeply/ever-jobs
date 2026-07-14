import { Module } from '@nestjs/common';
import { DustService } from './dust.service';

@Module({ providers: [DustService], exports: [DustService] })
export class DustModule {}
