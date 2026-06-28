import { Module } from '@nestjs/common';
import { SpliceService } from './splice.service';

@Module({ providers: [SpliceService], exports: [SpliceService] })
export class SpliceModule {}
