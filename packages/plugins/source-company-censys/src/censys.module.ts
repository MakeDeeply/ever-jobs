import { Module } from '@nestjs/common';
import { CensysService } from './censys.service';

@Module({ providers: [CensysService], exports: [CensysService] })
export class CensysModule {}
