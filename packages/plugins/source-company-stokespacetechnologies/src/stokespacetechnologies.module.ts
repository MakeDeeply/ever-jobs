import { Module } from '@nestjs/common';
import { StokeSpaceService } from './stokespacetechnologies.service';

@Module({ providers: [StokeSpaceService], exports: [StokeSpaceService] })
export class StokeSpaceModule {}
