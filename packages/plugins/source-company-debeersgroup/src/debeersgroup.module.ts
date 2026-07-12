import { Module } from '@nestjs/common';
import { DeBeersGroupService } from './debeersgroup.service';

@Module({ providers: [DeBeersGroupService], exports: [DeBeersGroupService] })
export class DeBeersGroupModule {}
