import { Module } from '@nestjs/common';
import { CandidHealthService } from './candidhealth.service';

@Module({ providers: [CandidHealthService], exports: [CandidHealthService] })
export class CandidHealthModule {}
