import { Module } from '@nestjs/common';
import { RexelService } from './rexel.service';

@Module({ providers: [RexelService], exports: [RexelService] })
export class RexelModule {}
