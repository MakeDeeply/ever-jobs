import { Module } from '@nestjs/common';
import { NovutechService } from './novutech.service';

@Module({ providers: [NovutechService], exports: [NovutechService] })
export class NovutechModule {}
