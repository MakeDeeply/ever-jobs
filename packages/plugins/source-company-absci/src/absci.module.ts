import { Module } from '@nestjs/common';
import { AbsciService } from './absci.service';

@Module({ providers: [AbsciService], exports: [AbsciService] })
export class AbsciModule {}
