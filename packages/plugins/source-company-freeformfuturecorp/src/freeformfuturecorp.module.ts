import { Module } from '@nestjs/common';
import { FreeformService } from './freeformfuturecorp.service';

@Module({ providers: [FreeformService], exports: [FreeformService] })
export class FreeformModule {}
