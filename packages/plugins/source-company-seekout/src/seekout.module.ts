import { Module } from '@nestjs/common';
import { SeekOutService } from './seekout.service';

@Module({ providers: [SeekOutService], exports: [SeekOutService] })
export class SeekOutModule {}
