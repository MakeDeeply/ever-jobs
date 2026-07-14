import { Module } from '@nestjs/common';
import { AECOMService } from './aecom.service';

@Module({ providers: [AECOMService], exports: [AECOMService] })
export class AECOMModule {}
