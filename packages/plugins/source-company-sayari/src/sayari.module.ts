import { Module } from '@nestjs/common';
import { SayariService } from './sayari.service';

@Module({ providers: [SayariService], exports: [SayariService] })
export class SayariModule {}
