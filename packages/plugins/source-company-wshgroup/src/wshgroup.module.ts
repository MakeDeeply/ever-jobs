import { Module } from '@nestjs/common';
import { WSHGroupService } from './wshgroup.service';

@Module({ providers: [WSHGroupService], exports: [WSHGroupService] })
export class WSHGroupModule {}
