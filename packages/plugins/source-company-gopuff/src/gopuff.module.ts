import { Module } from '@nestjs/common';
import { GopuffService } from './gopuff.service';

@Module({ providers: [GopuffService], exports: [GopuffService] })
export class GopuffModule {}
