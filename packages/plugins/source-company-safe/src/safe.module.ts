import { Module } from '@nestjs/common';
import { SafeSecurityService } from './safe.service';

@Module({ providers: [SafeSecurityService], exports: [SafeSecurityService] })
export class SafeSecurityModule {}
