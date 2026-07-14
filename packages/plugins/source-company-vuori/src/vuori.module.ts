import { Module } from '@nestjs/common';
import { VuoriService } from './vuori.service';

@Module({ providers: [VuoriService], exports: [VuoriService] })
export class VuoriModule {}
