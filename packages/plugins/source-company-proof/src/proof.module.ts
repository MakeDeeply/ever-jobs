import { Module } from '@nestjs/common';
import { ProofService } from './proof.service';

@Module({ providers: [ProofService], exports: [ProofService] })
export class ProofModule {}
