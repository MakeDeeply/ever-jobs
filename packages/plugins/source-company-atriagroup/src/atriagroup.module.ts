import { Module } from '@nestjs/common';
import { AtriaGroupService } from './atriagroup.service';

@Module({ providers: [AtriaGroupService], exports: [AtriaGroupService] })
export class AtriaGroupModule {}
