import { Module } from '@nestjs/common';
import { BrigitService } from './brigit.service';

@Module({ providers: [BrigitService], exports: [BrigitService] })
export class BrigitModule {}
