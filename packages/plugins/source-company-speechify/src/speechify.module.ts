import { Module } from '@nestjs/common';
import { SpeechifyService } from './speechify.service';

@Module({ providers: [SpeechifyService], exports: [SpeechifyService] })
export class SpeechifyModule {}
