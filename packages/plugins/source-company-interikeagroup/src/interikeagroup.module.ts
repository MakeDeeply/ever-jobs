import { Module } from '@nestjs/common';
import { InterIKEAGroupService } from './interikeagroup.service';

@Module({ providers: [InterIKEAGroupService], exports: [InterIKEAGroupService] })
export class InterIKEAGroupModule {}
