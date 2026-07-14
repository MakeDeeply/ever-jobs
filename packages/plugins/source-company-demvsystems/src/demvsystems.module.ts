import { Module } from '@nestjs/common';
import { DEMVSystemsService } from './demvsystems.service';

@Module({ providers: [DEMVSystemsService], exports: [DEMVSystemsService] })
export class DEMVSystemsModule {}
