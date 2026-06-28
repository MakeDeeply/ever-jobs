import { Module } from '@nestjs/common';
import { NabisService } from './nabis.service';

@Module({ providers: [NabisService], exports: [NabisService] })
export class NabisModule {}
