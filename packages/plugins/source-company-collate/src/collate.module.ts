import { Module } from '@nestjs/common';
import { CollateService } from './collate.service';

@Module({ providers: [CollateService], exports: [CollateService] })
export class CollateModule {}
