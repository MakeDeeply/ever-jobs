import { Module } from '@nestjs/common';
import { TebraService } from './tebra.service';

@Module({ providers: [TebraService], exports: [TebraService] })
export class TebraModule {}
