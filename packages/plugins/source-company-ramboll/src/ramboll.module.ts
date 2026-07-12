import { Module } from '@nestjs/common';
import { RambollService } from './ramboll.service';

@Module({ providers: [RambollService], exports: [RambollService] })
export class RambollModule {}
