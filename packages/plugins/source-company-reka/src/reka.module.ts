import { Module } from '@nestjs/common';
import { RekaService } from './reka.service';

@Module({ providers: [RekaService], exports: [RekaService] })
export class RekaModule {}
