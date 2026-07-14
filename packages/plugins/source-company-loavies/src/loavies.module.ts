import { Module } from '@nestjs/common';
import { LOAVIESService } from './loavies.service';

@Module({ providers: [LOAVIESService], exports: [LOAVIESService] })
export class LOAVIESModule {}
