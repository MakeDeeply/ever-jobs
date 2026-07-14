import { Module } from '@nestjs/common';
import { SkydioService } from './skydio.service';

@Module({ providers: [SkydioService], exports: [SkydioService] })
export class SkydioModule {}
