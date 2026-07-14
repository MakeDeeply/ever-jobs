import { Module } from '@nestjs/common';
import { SpreetailService } from './spreetail.service';

@Module({ providers: [SpreetailService], exports: [SpreetailService] })
export class SpreetailModule {}
