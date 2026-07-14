import { Module } from '@nestjs/common';
import { DexterraGroupService } from './dexterragroup.service';

@Module({ providers: [DexterraGroupService], exports: [DexterraGroupService] })
export class DexterraGroupModule {}
