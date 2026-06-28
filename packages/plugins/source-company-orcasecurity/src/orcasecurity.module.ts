import { Module } from '@nestjs/common';
import { OrcaSecurityService } from './orcasecurity.service';

@Module({ providers: [OrcaSecurityService], exports: [OrcaSecurityService] })
export class OrcaSecurityModule {}
