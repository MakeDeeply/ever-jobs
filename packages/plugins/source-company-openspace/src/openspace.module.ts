import { Module } from '@nestjs/common';
import { OpenSpaceService } from './openspace.service';

@Module({ providers: [OpenSpaceService], exports: [OpenSpaceService] })
export class OpenSpaceModule {}
