import { Module } from '@nestjs/common';
import { OpenTableService } from './opentable.service';

@Module({ providers: [OpenTableService], exports: [OpenTableService] })
export class OpenTableModule {}
