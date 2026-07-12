import { Module } from '@nestjs/common';
import { StemXpertService } from './stemxpert.service';

@Module({ providers: [StemXpertService], exports: [StemXpertService] })
export class StemXpertModule {}
