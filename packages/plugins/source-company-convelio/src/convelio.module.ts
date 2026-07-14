import { Module } from '@nestjs/common';
import { ConvelioService } from './convelio.service';

@Module({ providers: [ConvelioService], exports: [ConvelioService] })
export class ConvelioModule {}
