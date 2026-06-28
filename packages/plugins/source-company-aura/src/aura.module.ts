import { Module } from '@nestjs/common';
import { AuraService } from './aura.service';

@Module({ providers: [AuraService], exports: [AuraService] })
export class AuraModule {}
