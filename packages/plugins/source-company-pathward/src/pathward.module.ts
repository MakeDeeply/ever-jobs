import { Module } from '@nestjs/common';
import { PathwardService } from './pathward.service';

@Module({ providers: [PathwardService], exports: [PathwardService] })
export class PathwardModule {}
