import { Module } from '@nestjs/common';
import { CohereHealthService } from './coherehealth.service';

@Module({ providers: [CohereHealthService], exports: [CohereHealthService] })
export class CohereHealthModule {}
