import { Module } from '@nestjs/common';
import { RebuyService } from './rebuy.service';

@Module({ providers: [RebuyService], exports: [RebuyService] })
export class RebuyModule {}
