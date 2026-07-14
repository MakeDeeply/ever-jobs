import { Module } from '@nestjs/common';
import { EscapeService } from './escape.service';

@Module({ providers: [EscapeService], exports: [EscapeService] })
export class EscapeModule {}
