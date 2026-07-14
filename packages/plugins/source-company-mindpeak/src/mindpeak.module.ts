import { Module } from '@nestjs/common';
import { MindpeakService } from './mindpeak.service';

@Module({ providers: [MindpeakService], exports: [MindpeakService] })
export class MindpeakModule {}
