import { Module } from '@nestjs/common';
import { TrustlyService } from './trustly.service';

@Module({ providers: [TrustlyService], exports: [TrustlyService] })
export class TrustlyModule {}
