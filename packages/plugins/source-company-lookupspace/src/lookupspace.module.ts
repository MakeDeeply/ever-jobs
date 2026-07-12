import { Module } from '@nestjs/common';
import { LookUpSpaceService } from './lookupspace.service';

@Module({ providers: [LookUpSpaceService], exports: [LookUpSpaceService] })
export class LookUpSpaceModule {}
