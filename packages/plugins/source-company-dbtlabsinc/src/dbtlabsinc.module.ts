import { Module } from '@nestjs/common';
import { DbtLabsService } from './dbtlabsinc.service';

@Module({ providers: [DbtLabsService], exports: [DbtLabsService] })
export class DbtLabsModule {}
