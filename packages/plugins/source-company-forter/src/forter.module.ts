import { Module } from '@nestjs/common';
import { ForterService } from './forter.service';

@Module({ providers: [ForterService], exports: [ForterService] })
export class ForterModule {}
