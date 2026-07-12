import { Module } from '@nestjs/common';
import { ReadMeService } from './readme.service';

@Module({ providers: [ReadMeService], exports: [ReadMeService] })
export class ReadMeModule {}
