import { Module } from '@nestjs/common';
import { HighspotService } from './highspot.service';

@Module({ providers: [HighspotService], exports: [HighspotService] })
export class HighspotModule {}
