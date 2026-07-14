import { Module } from '@nestjs/common';
import { BoschGroupService } from './boschgroup.service';

@Module({ providers: [BoschGroupService], exports: [BoschGroupService] })
export class BoschGroupModule {}
