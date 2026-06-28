import { Module } from '@nestjs/common';
import { ForbesService } from './forbes.service';

@Module({ providers: [ForbesService], exports: [ForbesService] })
export class ForbesModule {}
