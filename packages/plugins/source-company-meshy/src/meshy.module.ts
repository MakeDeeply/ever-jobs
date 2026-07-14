import { Module } from '@nestjs/common';
import { MeshyService } from './meshy.service';

@Module({ providers: [MeshyService], exports: [MeshyService] })
export class MeshyModule {}
