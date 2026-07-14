import { Module } from '@nestjs/common';
import { HoistGroupService } from './hoistgroup.service';

@Module({ providers: [HoistGroupService], exports: [HoistGroupService] })
export class HoistGroupModule {}
