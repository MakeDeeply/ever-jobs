import { Module } from '@nestjs/common';
import { WaabiService } from './waabi.service';

@Module({ providers: [WaabiService], exports: [WaabiService] })
export class WaabiModule {}
