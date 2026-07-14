import { Module } from '@nestjs/common';
import { NemeraService } from './nemera.service';

@Module({ providers: [NemeraService], exports: [NemeraService] })
export class NemeraModule {}
