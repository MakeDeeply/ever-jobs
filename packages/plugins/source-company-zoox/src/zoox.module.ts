import { Module } from '@nestjs/common';
import { ZooxService } from './zoox.service';

@Module({ providers: [ZooxService], exports: [ZooxService] })
export class ZooxModule {}
