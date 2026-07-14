import { Module } from '@nestjs/common';
import { LVMHService } from './lvmh.service';

@Module({ providers: [LVMHService], exports: [LVMHService] })
export class LVMHModule {}
