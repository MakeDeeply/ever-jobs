import { Module } from '@nestjs/common';
import { NothingService } from './nothing.service';

@Module({ providers: [NothingService], exports: [NothingService] })
export class NothingModule {}
