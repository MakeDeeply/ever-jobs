import { Module } from '@nestjs/common';
import { RothySService } from './rothys.service';

@Module({ providers: [RothySService], exports: [RothySService] })
export class RothySModule {}
