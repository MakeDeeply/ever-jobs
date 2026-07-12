import { Module } from '@nestjs/common';
import { GridwareService } from './gridware.service';

@Module({ providers: [GridwareService], exports: [GridwareService] })
export class GridwareModule {}
