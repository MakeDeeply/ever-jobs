import { Module } from '@nestjs/common';
import { ZeroMarkService } from './zeromark.service';

@Module({ providers: [ZeroMarkService], exports: [ZeroMarkService] })
export class ZeroMarkModule {}
