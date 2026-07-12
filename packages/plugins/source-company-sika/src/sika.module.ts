import { Module } from '@nestjs/common';
import { SikaService } from './sika.service';

@Module({ providers: [SikaService], exports: [SikaService] })
export class SikaModule {}
