import { Module } from '@nestjs/common';
import { VerifiableService } from './verifiable.service';

@Module({ providers: [VerifiableService], exports: [VerifiableService] })
export class VerifiableModule {}
