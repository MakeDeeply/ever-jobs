import { Module } from '@nestjs/common';
import { TransmitSecurityService } from './transmitsecurity.service';

@Module({ providers: [TransmitSecurityService], exports: [TransmitSecurityService] })
export class TransmitSecurityModule {}
