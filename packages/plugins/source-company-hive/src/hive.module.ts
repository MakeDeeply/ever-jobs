import { Module } from '@nestjs/common';
import { HiveService } from './hive.service';

@Module({ providers: [HiveService], exports: [HiveService] })
export class HiveModule {}
