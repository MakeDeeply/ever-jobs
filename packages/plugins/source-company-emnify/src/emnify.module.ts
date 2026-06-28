import { Module } from '@nestjs/common';
import { EmnifyService } from './emnify.service';

@Module({ providers: [EmnifyService], exports: [EmnifyService] })
export class EmnifyModule {}
