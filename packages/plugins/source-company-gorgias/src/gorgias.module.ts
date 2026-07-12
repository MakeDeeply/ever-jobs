import { Module } from '@nestjs/common';
import { GorgiasService } from './gorgias.service';

@Module({ providers: [GorgiasService], exports: [GorgiasService] })
export class GorgiasModule {}
