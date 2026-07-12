import { Module } from '@nestjs/common';
import { SportradarService } from './sportradar.service';

@Module({ providers: [SportradarService], exports: [SportradarService] })
export class SportradarModule {}
