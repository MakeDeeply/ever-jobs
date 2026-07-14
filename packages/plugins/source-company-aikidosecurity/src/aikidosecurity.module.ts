import { Module } from '@nestjs/common';
import { AikidoSecurityService } from './aikidosecurity.service';

@Module({ providers: [AikidoSecurityService], exports: [AikidoSecurityService] })
export class AikidoSecurityModule {}
