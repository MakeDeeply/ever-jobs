import { Module } from '@nestjs/common';
import { BuildOpsService } from './buildops.service';

@Module({ providers: [BuildOpsService], exports: [BuildOpsService] })
export class BuildOpsModule {}
