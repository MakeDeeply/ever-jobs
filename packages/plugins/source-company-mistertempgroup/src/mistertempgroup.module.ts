import { Module } from '@nestjs/common';
import { MistertempGroupService } from './mistertempgroup.service';

@Module({ providers: [MistertempGroupService], exports: [MistertempGroupService] })
export class MistertempGroupModule {}
