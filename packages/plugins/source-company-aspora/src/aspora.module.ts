import { Module } from '@nestjs/common';
import { AsporaService } from './aspora.service';

@Module({ providers: [AsporaService], exports: [AsporaService] })
export class AsporaModule {}
