import { Module } from '@nestjs/common';
import { VillaGroupService } from './villagroup.service';

@Module({ providers: [VillaGroupService], exports: [VillaGroupService] })
export class VillaGroupModule {}
