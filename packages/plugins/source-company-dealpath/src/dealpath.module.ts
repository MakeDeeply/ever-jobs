import { Module } from '@nestjs/common';
import { DealpathService } from './dealpath.service';

@Module({ providers: [DealpathService], exports: [DealpathService] })
export class DealpathModule {}
