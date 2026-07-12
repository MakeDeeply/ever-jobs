import { Module } from '@nestjs/common';
import { SambaTVService } from './sambatv.service';

@Module({ providers: [SambaTVService], exports: [SambaTVService] })
export class SambaTVModule {}
