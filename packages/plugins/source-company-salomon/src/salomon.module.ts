import { Module } from '@nestjs/common';
import { SalomonService } from './salomon.service';

@Module({ providers: [SalomonService], exports: [SalomonService] })
export class SalomonModule {}
