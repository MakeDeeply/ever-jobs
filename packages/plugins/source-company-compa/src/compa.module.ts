import { Module } from '@nestjs/common';
import { CompaService } from './compa.service';

@Module({ providers: [CompaService], exports: [CompaService] })
export class CompaModule {}
