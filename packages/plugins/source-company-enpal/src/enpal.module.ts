import { Module } from '@nestjs/common';
import { EnpalService } from './enpal.service';

@Module({ providers: [EnpalService], exports: [EnpalService] })
export class EnpalModule {}
