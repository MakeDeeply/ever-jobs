import { Module } from '@nestjs/common';
import { EgisGroupService } from './egisgroup.service';

@Module({ providers: [EgisGroupService], exports: [EgisGroupService] })
export class EgisGroupModule {}
