import { Module } from '@nestjs/common';
import { GoGuardianService } from './goguardian.service';

@Module({ providers: [GoGuardianService], exports: [GoGuardianService] })
export class GoGuardianModule {}
