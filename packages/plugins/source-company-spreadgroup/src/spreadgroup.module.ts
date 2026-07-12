import { Module } from '@nestjs/common';
import { SpreadGroupService } from './spreadgroup.service';

@Module({ providers: [SpreadGroupService], exports: [SpreadGroupService] })
export class SpreadGroupModule {}
