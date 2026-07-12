import { Module } from '@nestjs/common';
import { LarianStudiosService } from './larian.service';

@Module({ providers: [LarianStudiosService], exports: [LarianStudiosService] })
export class LarianStudiosModule {}
