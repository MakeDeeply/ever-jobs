import { Module } from '@nestjs/common';
import { NPRNationalPublicRadioService } from './nationalpublicradioinc.service';

@Module({ providers: [NPRNationalPublicRadioService], exports: [NPRNationalPublicRadioService] })
export class NPRNationalPublicRadioModule {}
