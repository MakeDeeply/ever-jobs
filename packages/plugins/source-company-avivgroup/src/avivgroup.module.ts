import { Module } from '@nestjs/common';
import { AVIVGroupService } from './avivgroup.service';

@Module({ providers: [AVIVGroupService], exports: [AVIVGroupService] })
export class AVIVGroupModule {}
