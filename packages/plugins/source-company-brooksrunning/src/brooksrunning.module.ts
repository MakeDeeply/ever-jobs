import { Module } from '@nestjs/common';
import { BrooksRunningService } from './brooksrunning.service';

@Module({ providers: [BrooksRunningService], exports: [BrooksRunningService] })
export class BrooksRunningModule {}
