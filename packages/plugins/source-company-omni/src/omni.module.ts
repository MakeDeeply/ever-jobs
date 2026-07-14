import { Module } from '@nestjs/common';
import { OmniService } from './omni.service';

@Module({ providers: [OmniService], exports: [OmniService] })
export class OmniModule {}
