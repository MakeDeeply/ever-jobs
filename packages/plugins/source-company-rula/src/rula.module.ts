import { Module } from '@nestjs/common';
import { RulaService } from './rula.service';

@Module({ providers: [RulaService], exports: [RulaService] })
export class RulaModule {}
