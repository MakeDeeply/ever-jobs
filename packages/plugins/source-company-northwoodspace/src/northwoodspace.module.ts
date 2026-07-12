import { Module } from '@nestjs/common';
import { NorthwoodSpaceService } from './northwoodspace.service';

@Module({ providers: [NorthwoodSpaceService], exports: [NorthwoodSpaceService] })
export class NorthwoodSpaceModule {}
