import { Module } from '@nestjs/common';
import { CertifIDService } from './certifid.service';

@Module({ providers: [CertifIDService], exports: [CertifIDService] })
export class CertifIDModule {}
