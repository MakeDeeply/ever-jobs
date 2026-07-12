import { Module } from '@nestjs/common';
import { VIKTORService } from './viktor.service';

@Module({ providers: [VIKTORService], exports: [VIKTORService] })
export class VIKTORModule {}
