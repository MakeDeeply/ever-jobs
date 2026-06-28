import { Module } from '@nestjs/common';
import { GoodwayGroupService } from './goodwaygroup.service';

@Module({ providers: [GoodwayGroupService], exports: [GoodwayGroupService] })
export class GoodwayGroupModule {}
