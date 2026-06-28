import { Module } from '@nestjs/common';
import { AEVEXAerospaceService } from './aevexaerospace.service';

@Module({ providers: [AEVEXAerospaceService], exports: [AEVEXAerospaceService] })
export class AEVEXAerospaceModule {}
