import { Module } from '@nestjs/common';
import { TraackrService } from './traackr.service';

@Module({ providers: [TraackrService], exports: [TraackrService] })
export class TraackrModule {}
