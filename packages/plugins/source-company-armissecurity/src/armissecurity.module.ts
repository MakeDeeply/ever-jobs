import { Module } from '@nestjs/common';
import { ArmisService } from './armissecurity.service';

@Module({ providers: [ArmisService], exports: [ArmisService] })
export class ArmisModule {}
