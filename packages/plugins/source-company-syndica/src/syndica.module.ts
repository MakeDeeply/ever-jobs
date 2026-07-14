import { Module } from '@nestjs/common';
import { SyndicaService } from './syndica.service';

@Module({ providers: [SyndicaService], exports: [SyndicaService] })
export class SyndicaModule {}
