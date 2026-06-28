import { Module } from '@nestjs/common';
import { FederatoService } from './federato.service';

@Module({ providers: [FederatoService], exports: [FederatoService] })
export class FederatoModule {}
