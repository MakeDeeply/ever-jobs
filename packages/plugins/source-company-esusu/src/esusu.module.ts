import { Module } from '@nestjs/common';
import { EsusuService } from './esusu.service';

@Module({ providers: [EsusuService], exports: [EsusuService] })
export class EsusuModule {}
