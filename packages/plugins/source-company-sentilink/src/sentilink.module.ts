import { Module } from '@nestjs/common';
import { SentiLinkService } from './sentilink.service';

@Module({ providers: [SentiLinkService], exports: [SentiLinkService] })
export class SentiLinkModule {}
