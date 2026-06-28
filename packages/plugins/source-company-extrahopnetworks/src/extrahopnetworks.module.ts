import { Module } from '@nestjs/common';
import { ExtraHopService } from './extrahopnetworks.service';

@Module({ providers: [ExtraHopService], exports: [ExtraHopService] })
export class ExtraHopModule {}
