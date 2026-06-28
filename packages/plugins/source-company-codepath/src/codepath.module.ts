import { Module } from '@nestjs/common';
import { CodePathService } from './codepath.service';

@Module({ providers: [CodePathService], exports: [CodePathService] })
export class CodePathModule {}
