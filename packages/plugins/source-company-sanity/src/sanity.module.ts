import { Module } from '@nestjs/common';
import { SanityService } from './sanity.service';

@Module({ providers: [SanityService], exports: [SanityService] })
export class SanityModule {}
