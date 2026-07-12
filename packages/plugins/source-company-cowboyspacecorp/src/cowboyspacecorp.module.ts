import { Module } from '@nestjs/common';
import { CowboySpaceCorpService } from './cowboyspacecorp.service';

@Module({ providers: [CowboySpaceCorpService], exports: [CowboySpaceCorpService] })
export class CowboySpaceCorpModule {}
