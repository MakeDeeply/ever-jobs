import { Module } from '@nestjs/common';
import { MujinService } from './mujininc.service';

@Module({ providers: [MujinService], exports: [MujinService] })
export class MujinModule {}
