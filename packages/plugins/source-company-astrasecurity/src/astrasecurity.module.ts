import { Module } from '@nestjs/common';
import { AstraSecurityService } from './astrasecurity.service';

@Module({ providers: [AstraSecurityService], exports: [AstraSecurityService] })
export class AstraSecurityModule {}
