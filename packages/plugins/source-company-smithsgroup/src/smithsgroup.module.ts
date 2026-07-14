import { Module } from '@nestjs/common';
import { SmithsGroupService } from './smithsgroup.service';

@Module({ providers: [SmithsGroupService], exports: [SmithsGroupService] })
export class SmithsGroupModule {}
