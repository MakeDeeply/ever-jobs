import { Module } from '@nestjs/common';
import { FoxitService } from './foxitsoftware.service';

@Module({ providers: [FoxitService], exports: [FoxitService] })
export class FoxitModule {}
