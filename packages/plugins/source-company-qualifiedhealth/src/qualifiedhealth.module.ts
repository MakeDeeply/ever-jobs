import { Module } from '@nestjs/common';
import { QualifiedHealthService } from './qualifiedhealth.service';

@Module({ providers: [QualifiedHealthService], exports: [QualifiedHealthService] })
export class QualifiedHealthModule {}
