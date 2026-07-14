import { Module } from '@nestjs/common';
import { InfisicalService } from './infisical.service';

@Module({ providers: [InfisicalService], exports: [InfisicalService] })
export class InfisicalModule {}
