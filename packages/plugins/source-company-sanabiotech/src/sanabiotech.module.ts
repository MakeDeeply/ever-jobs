import { Module } from '@nestjs/common';
import { SanaBiotechnologyService } from './sanabiotech.service';

@Module({ providers: [SanaBiotechnologyService], exports: [SanaBiotechnologyService] })
export class SanaBiotechnologyModule {}
