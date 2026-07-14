import { Module } from '@nestjs/common';
import { HighbeamService } from './highbeam.service';

@Module({ providers: [HighbeamService], exports: [HighbeamService] })
export class HighbeamModule {}
