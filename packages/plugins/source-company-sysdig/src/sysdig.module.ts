import { Module } from '@nestjs/common';
import { SysdigService } from './sysdig.service';

@Module({ providers: [SysdigService], exports: [SysdigService] })
export class SysdigModule {}
