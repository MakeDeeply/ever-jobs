import { Module } from '@nestjs/common';
import { MadhappyService } from './madhappy.service';

@Module({ providers: [MadhappyService], exports: [MadhappyService] })
export class MadhappyModule {}
