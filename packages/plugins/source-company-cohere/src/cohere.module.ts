import { Module } from '@nestjs/common';
import { CohereService } from './cohere.service';

@Module({ providers: [CohereService], exports: [CohereService] })
export class CohereModule {}
