import { Module } from '@nestjs/common';
import { GRAILService } from './grailbio.service';

@Module({ providers: [GRAILService], exports: [GRAILService] })
export class GRAILModule {}
