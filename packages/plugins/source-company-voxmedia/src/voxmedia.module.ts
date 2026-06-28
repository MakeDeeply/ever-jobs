import { Module } from '@nestjs/common';
import { VoxMediaService } from './voxmedia.service';

@Module({ providers: [VoxMediaService], exports: [VoxMediaService] })
export class VoxMediaModule {}
