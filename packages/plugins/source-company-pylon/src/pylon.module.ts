import { Module } from '@nestjs/common';
import { PylonService } from './pylon.service';

@Module({ providers: [PylonService], exports: [PylonService] })
export class PylonModule {}
