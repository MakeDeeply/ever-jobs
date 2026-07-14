import { Module } from '@nestjs/common';
import { StructubeService } from './structube.service';

@Module({ providers: [StructubeService], exports: [StructubeService] })
export class StructubeModule {}
