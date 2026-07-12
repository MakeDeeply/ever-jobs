import { Module } from '@nestjs/common';
import { LasanGroupService } from './lasangroup.service';

@Module({ providers: [LasanGroupService], exports: [LasanGroupService] })
export class LasanGroupModule {}
