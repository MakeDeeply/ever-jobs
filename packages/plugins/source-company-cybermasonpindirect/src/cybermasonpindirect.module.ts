import { Module } from '@nestjs/common';
import { CyberMasonPinDirectService } from './cybermasonpindirect.service';

@Module({ providers: [CyberMasonPinDirectService], exports: [CyberMasonPinDirectService] })
export class CyberMasonPinDirectModule {}
