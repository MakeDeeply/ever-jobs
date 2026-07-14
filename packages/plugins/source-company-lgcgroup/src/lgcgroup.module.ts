import { Module } from '@nestjs/common';
import { LGCGroupService } from './lgcgroup.service';

@Module({ providers: [LGCGroupService], exports: [LGCGroupService] })
export class LGCGroupModule {}
